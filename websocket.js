import {WebSocketServer}  from 'ws'
import * as cookie from 'cookie' 
import signature from 'cookie-signature'
import { ModelNormal, ModelPendingReq, ModelSid,Modelconnections,ModelGoogle, ModelDataAll } from './mongooseShema.js'
import {createServer} from 'http'
import express from 'express'
import 'dotenv/config'


const allUsersData=async (valueMain)=>{
    const mineName = valueMain.mineName
    const dataNormal=await ModelNormal.find().lean() 
    const dataGoogle=await ModelGoogle.find().lean()
    let users=[]
    dataNormal.forEach((ele)=>{
        users.push(ele.name)
    })
    dataGoogle.forEach((ele)=>{
        users.push(ele.name)
    })
    users=users.filter((ele)=>ele!=mineName)

    const connections = await Modelconnections.find({
        $or: [{ a: mineName }, { b: mineName }]
    }).lean()
    const friends = new Set(connections.map(c => c.a === mineName ? c.b : c.a))

    const pendingReqs = await ModelPendingReq.find({
        $or: [{ from: mineName }, { to: mineName }]
    }).lean()
    
    const sentPendings = new Set(pendingReqs.filter(r => r.from === mineName).map(r => r.to))
    const receivedPendings = new Set(pendingReqs.filter(r => r.to === mineName).map(r => r.from))

    return users.map(u => {
        let status = 'none'
        if (friends.has(u)) {
            status = 'friend'
        } else if (sentPendings.has(u)) {
            status = 'pending_sent'
        } else if (receivedPendings.has(u)) {
            status = 'pending_received'
        }
        return { name: u, status }
    })
}
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
const app=express();
const httpServer=createServer(app);
const server=new WebSocketServer({server:httpServer});
const storing={}
server.on('connection', (ws, req) => {
    const cookies = req.headers.cookie
    const real = cookie.parse(cookies || '')
    
    let isAuthenticated = false
    const messageQueue = []
    let userNameKey = null

    const handleMessage = async (msg) => {
        try {
            const valueMain = JSON.parse(msg.toString())
            const { kindOf } = valueMain
            
            if (kindOf === 'allUsersData') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                const data = await allUsersData(valueMain)
                ws.send(JSON.stringify({ kindOf: 'allUsersData', data }))
            }
            else if (kindOf === 'allFriendsToMe') {  
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                allFriendsToMe(valueMain.from, ws)
            }
            else if (kindOf === 'addReq') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                const previousConnectionIfExists = await Modelconnections.findOne({ $or: [{ a: valueMain.to, b: valueMain.from }, { a: valueMain.from, b: valueMain.to }] })
                if (previousConnectionIfExists) {
                    ws.send(JSON.stringify({ mess: 'already a Friend' }))
                }
                else {
                    const alreadySendReq = await ModelPendingReq.findOne({ from: valueMain.from, to: valueMain.to })
                    if (alreadySendReq) {
                        ws.send(JSON.stringify({ mess: "already send the request" }))
                    }
                    else {
                        await ModelPendingReq.create({ from: valueMain.from, to: valueMain.to })
                        
                        const dataFrom = await allUsersData({ mineName: valueMain.from })
                        ws.send(JSON.stringify({ kindOf: 'allUsersData', data: dataFrom }))

                        const CurrSocket = storing[valueMain.to]
                        if (CurrSocket !== undefined) {
                            let allPendingsForOtherOne = await ModelPendingReq.find({ to: valueMain.to })
                            allPendingsForOtherOne = allPendingsForOtherOne.map((ele) => {
                                return ele.from
                            })
                            CurrSocket.send(JSON.stringify({ kindOf: "pendingsToMe", data: allPendingsForOtherOne }))

                            const dataTo = await allUsersData({ mineName: valueMain.to })
                            CurrSocket.send(JSON.stringify({ kindOf: 'allUsersData', data: dataTo }))
                        }
                    }
                }
            }
            else if (kindOf === 'ack') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                const checkExists = await ModelPendingReq.findOne({ from: valueMain.from, to: valueMain.to })
                if (checkExists) {
                    const aId = await ModelNormal.findOne({ name: valueMain.from }) || await ModelGoogle.findOne({ name: valueMain.from })
                    const bId = await ModelNormal.findOne({ name: valueMain.to }) || await ModelGoogle.findOne({ name: valueMain.to })
                    await Modelconnections.create({ a: valueMain.from, b: valueMain.to, aId: aId, bId: bId })
                    await ModelPendingReq.deleteMany({ from: valueMain.to, to: valueMain.from })
                    await ModelPendingReq.deleteMany({ from: valueMain.from, to: valueMain.to })
                    
                    // Send updated pending requests list to the user accepting the request
                    let allPendingsForMe = await ModelPendingReq.find({ to: valueMain.to })
                    allPendingsForMe = allPendingsForMe.map((ele) => {
                        return ele.from
                    })
                    ws.send(JSON.stringify({ kindOf: "pendingsToMe", data: allPendingsForMe }))

                    allFriendsToMe(valueMain.to, ws)

                    const dataTo = await allUsersData({ mineName: valueMain.to })
                    ws.send(JSON.stringify({ kindOf: 'allUsersData', data: dataTo }))
                    
                    const socketOfOther = storing[valueMain.from]
                    if (socketOfOther) {
                        allFriendsToMe(valueMain.from, socketOfOther)

                        const dataFrom = await allUsersData({ mineName: valueMain.from })
                        socketOfOther.send(JSON.stringify({ kindOf: 'allUsersData', data: dataFrom }))
                    }
                }
            }
            else if (kindOf === 'rejectReq') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                await ModelPendingReq.deleteMany({
                    $or: [
                        { from: valueMain.from, to: valueMain.to },
                        { from: valueMain.to, to: valueMain.from }
                    ]
                })
                
                let allPendingsForMe = await ModelPendingReq.find({ to: valueMain.to })
                allPendingsForMe = allPendingsForMe.map((ele) => {
                    return ele.from
                })
                ws.send(JSON.stringify({ kindOf: "pendingsToMe", data: allPendingsForMe }))

                const dataTo = await allUsersData({ mineName: valueMain.to })
                ws.send(JSON.stringify({ kindOf: 'allUsersData', data: dataTo }))
                
                const socketOfOther = storing[valueMain.from]
                if (socketOfOther) {
                    const dataFrom = await allUsersData({ mineName: valueMain.from })
                    socketOfOther.send(JSON.stringify({ kindOf: 'allUsersData', data: dataFrom }))
                }
            }
            else if (kindOf === 'chat') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                try {
                    const idFinding = await Modelconnections.findOne({ a: valueMain.from, b: valueMain.to }) || await Modelconnections.findOne({ a: valueMain.to, b: valueMain.from })
                    if (!idFinding) {
                        console.log(`Connection not found between ${valueMain.from} and ${valueMain.to}`);
                        return;
                    }
                    const opsTime = await ModelDataAll.insertOne({ searchId: idFinding.id, msg: valueMain.input, from: valueMain.from, to: valueMain.to, isDeleted: false })
                    
                    ws.send(JSON.stringify({ kindOf: 'messageSentAck', tempId: valueMain.tempId, id: opsTime._id, msg: valueMain.input }))

                    if (storing[valueMain.to]) {
                        storing[valueMain.to].send(JSON.stringify({ kindOf: 'chatMessage', msg: valueMain.input, from: valueMain.from, timeAt: opsTime.timeAT, id: opsTime._id }))
                    }
                }
                catch (err) {
                    console.log("err", err)
                }
            }
            else if (kindOf === 'removeFriend') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                await Modelconnections.deleteOne({
                    $or: [
                        { a: valueMain.from, b: valueMain.to },
                        { a: valueMain.to, b: valueMain.from }
                    ]
                })
                allFriendsToMe(valueMain.from, ws)

                const dataFrom = await allUsersData({ mineName: valueMain.from })
                ws.send(JSON.stringify({ kindOf: 'allUsersData', data: dataFrom }))
                
                const socketOfOther = storing[valueMain.to]
                if (socketOfOther) {
                    allFriendsToMe(valueMain.to, socketOfOther)
                    socketOfOther.send(JSON.stringify({ kindOf: 'friendRemoved', from: valueMain.from }))

                    const dataTo = await allUsersData({ mineName: valueMain.to })
                    socketOfOther.send(JSON.stringify({ kindOf: 'allUsersData', data: dataTo }))
                }
            }
            else if (kindOf === 'deletingChat') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                const msgIds = valueMain.msgIds || [valueMain.msgId]
                const deleteType = valueMain.deleteType || 'everyone'
                
                if (deleteType === 'everyone') {
                    await ModelDataAll.updateMany({ _id: { $in: msgIds }, from: valueMain.from }, { $set: { isDeleted: true } })
                    
                    ws.send(JSON.stringify({ kindOf: 'chatMessagesDeleted', msgIds: msgIds, deleteType: 'everyone' }))
                    
                    const socketOfOther = storing[valueMain.to]
                    if (socketOfOther) {
                        socketOfOther.send(JSON.stringify({ kindOf: 'chatMessagesDeleted', msgIds: msgIds, deleteType: 'everyone' }))
                    }
                } else if (deleteType === 'me') {
                    await ModelDataAll.updateMany({ _id: { $in: msgIds } }, { $addToSet: { deletedFor: valueMain.from } })
                    
                    ws.send(JSON.stringify({ kindOf: 'chatMessagesDeleted', msgIds: msgIds, deleteType: 'me' }))
                }
            }
            else if (kindOf === 'pendingReqsForMe') {
                if (!real.sid) {
                    throw new Error("sid not found")
                }
                let allPendingsForMe = await ModelPendingReq.find({ to: valueMain.from })
                allPendingsForMe = allPendingsForMe.map((ele) => {
                    return ele.from
                })
                ws.send(JSON.stringify({ kindOf: "pendingsToMe", data: allPendingsForMe }))
            }
            else if (kindOf === 'newLogin') {
                for (let [userName, socket] of Object.entries(storing)) {
                    if (socket === ws) {
                        continue
                    }
                    let valueMain = { mineName: userName }
                    let data = await allUsersData(valueMain)
                    socket.send(JSON.stringify({ kindOf: 'allUsersData', data }))
                }
            }
        } catch (err) {
            ws.send(JSON.stringify({ kindOf: 'reLogin' }))
        }
    }

    // Attach message listener synchronously so we never miss incoming frames
    ws.on('message', (msg) => {
        if (!isAuthenticated) {
            messageQueue.push(msg)
        } else {
            handleMessage(msg)
        }
    })

    // Perform asynchronous database lookup for authentication
    ;(async () => {
        try {
            if (real.sid) {
                const signed = real.sid
                const value = signed.slice(2)
                const reavalue = signature.unsign(value, process.env.SECRET)
                console.log(reavalue, reavalue.slice(2))
                
                const ssidValidation = await ModelSid.findOne({ _id: reavalue })
                if (ssidValidation == null) {
                    ws.send(JSON.stringify({ kindOf: 'reLogin' }))
                    return ws.terminate()
                }
                else {
                    const userName = ssidValidation.name
                    if (storing[userName]) {
                        const oldSocket = storing[userName]
                        if (oldSocket !== ws) {
                            if (oldSocket.readyState === WebSocket.OPEN) {
                                oldSocket.send(JSON.stringify({ kindOf: 'reLogin' }))
                            }
                            oldSocket.terminate()
                        }
                    }
                    
                    userNameKey = userName
                    storing[userNameKey] = ws
                    ws.on('close', () => {
                        if (userNameKey && storing[userNameKey] === ws) {
                            delete storing[userNameKey]
                        }
                    })

                    // Authentication succeeded, process any buffered messages
                    isAuthenticated = true
                    for (const msg of messageQueue) {
                        await handleMessage(msg)
                    }
                }
            } else {
                ws.send(JSON.stringify({ kindOf: 'reLogin' }))
                ws.terminate()
            }
        } catch (err) {
            console.error("Error during session validation:", err)
            ws.send(JSON.stringify({ kindOf: 'reLogin' }))
            ws.terminate()
        }
    })()
})
const broadcastAllUsers = async () => {
    for (let [userName, socket] of Object.entries(storing)) {
        let valueMain = { mineName: userName }
        let data = await allUsersData(valueMain)
        socket.send(JSON.stringify({ kindOf: 'allUsersData', data }))
    }
}
export {
    app,
    httpServer,
    server,
    broadcastAllUsers
}