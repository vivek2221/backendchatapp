import {WebSocketServer}  from 'ws'
import * as cookie from 'cookie' 
import signature from 'cookie-signature'
import { ModelNormal, ModelPendingReq, ModelSid,Modelconnections,ModelGoogle, ModelDataAll } from './mongooseShema.js'

const allFriendsToMe=async(from,ws)=>{
    const allFriendsAsA=await Modelconnections.find({a:from})
        const allFriendsAsB=await Modelconnections.find({b:from})
        let data=allFriendsAsA.map((ele)=>{
            return ele.b
        })
        allFriendsAsB.forEach((ele)=>{
            data.push(ele.a)
        })
        ws.send(JSON.stringify({kindOf:'allFriendsToMe',data}))
}
const server=new WebSocketServer({port:process.env.webSocketServer,host:process.env.urlCommon})
const storing={}
server.on('connection',async(ws,req)=>{
    const cookies=req.headers.cookie
    const real=cookie.parse(cookies || '')
    const signed=real.sid
    const value =signed.slice(2)
    const reavalue=signature.unsign(value,'vivek')
    storing[reavalue]=ws
    console.log(storing)
    ws.on('close', () => {
    delete storing[reavalue];
    })
    ws.on('message',async(msg)=>{
        const valueMain=JSON.parse(msg.toString())
        const {kindOf}=valueMain
    if(kindOf==='allUsersData'){
        const dataNormal=await ModelNormal.find().lean() 
        const dataGoogle=await ModelGoogle.find().lean()
        let data=[]
        dataNormal.forEach((ele)=>{
            data.push(ele.name)
        })
        dataGoogle.forEach((ele)=>{
            data.push(ele.name)
        })
        data=data.filter((ele)=>ele!=valueMain.mineName)
        ws.send(JSON.stringify({kindOf:'allUsersData',data}))
    }
    else if(kindOf==='allFriendsToMe'){
         allFriendsToMe(valueMain.from,ws)
    }
       else if(kindOf==='addReq'){
        const previousConnectionIfExists=await Modelconnections.findOne({$or:[{a:valueMain.to,b:valueMain.from},{a:valueMain.from,b:valueMain.to}]})
        if(previousConnectionIfExists){
            ws.send(JSON.stringify({errMess:'already a Friend'}))
        }
        else{
        const alreadySendReq=await ModelPendingReq.findOne({from:valueMain.from,to:valueMain.to})
        if(alreadySendReq){
           ws.send(JSON.stringify({errMess:"already send the request"})) 
        }
        else{
        await ModelPendingReq.create({from:valueMain.from,to:valueMain.to})
        const findforWhom=await ModelNormal.findOne({name:valueMain.to})||await ModelGoogle.findOne({name:valueMain.to})
        if(findforWhom){
            const ssidOfthatUser=await ModelSid.findOne({someId:findforWhom.id})
            if(ssidOfthatUser){
                const CurrSocketssid=storing[ssidOfthatUser.id]
                if(CurrSocketssid!==undefined){
                    let allPendingsForMe=await ModelPendingReq.find({to:valueMain.to})
                    allPendingsForMe = allPendingsForMe.map((ele)=>{
                        return ele.from})
                    CurrSocketssid.send(JSON.stringify({kindOf:"pendingsToMe",data:allPendingsForMe}))
                }
            }
        }}}
        }
        else if(kindOf==='ack'){
            const checkExists=await ModelPendingReq.findOne({from:valueMain.from,to:valueMain.to})
            if(checkExists){
                const aId=await ModelNormal.findOne({name:valueMain.from}) || await ModelGoogle.findOne({name:valueMain.from})
                 const bId=await ModelNormal.findOne({name:valueMain.to}) || await ModelGoogle.findOne({name:valueMain.to})
                await Modelconnections.create({a:valueMain.from,b:valueMain.to,aId,bId})
                await ModelPendingReq.deleteMany({from:valueMain.to,to:valueMain.from})
                await ModelPendingReq.deleteMany({from:valueMain.from,to:valueMain.to})
                allFriendsToMe(valueMain.from,ws)
                const  ssidOtherUser = await ModelSid.findOne({sid:bId})
                if(ssidOtherUser){
                    let socketOfOther=storing[ssidOtherUser.id]
                    allFriendsToMe(valueMain.to,socketOfOther)
                }
            }
            
        }
        else if(kindOf==='chat'){
            const idFinding=await Modelconnections.findOne({a:valueMain.from,b:valueMain.to}) || await Modelconnections.findOne({a:valueMain.to,b:valueMain.from})
            if(idFinding){
            const opsTime=await ModelDataAll.insertOne({searchId:idFinding.id,msg:valueMain.input,from:valueMain.from,to:valueMain.to})
            try{
                const toIdSid= await ModelSid.findOne({name:valueMain.to})
                if(storing[toIdSid.id]){
                storing[toIdSid.id].send(JSON.stringify({kindOf:'chatMessage',msg:valueMain.input,from:valueMain.from,timeAt:opsTime.timeAT}))
                }
        }
            catch(err){
                console.log("err",err)
            }}
        }
        else if(kindOf==='pendingReqsForMe'){
           let allPendingsForMe=await ModelPendingReq.find({to:valueMain.from})
           allPendingsForMe= allPendingsForMe.map((ele)=>{
           return ele.from})
           ws.send(JSON.stringify({kindOf:"pendingsToMe",data:allPendingsForMe}))
        }
        
    })
})