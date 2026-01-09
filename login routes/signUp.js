import express from 'express'
import {ModelGoogle,ModelNormal,ModelOtp,ModelSid} from '../mongooseShema.js'
const sameSite='lax'
const secure=false
const server=express.Router()
async function normal(res,req,name,email,password,otp){
   const nameCheck=await ModelNormal.findOne({name})
      const nameCheckGoogle=await ModelGoogle.findOne({name})
      if(nameCheck || nameCheckGoogle){
         return res.json({mess:'user with userName already exists'})
      }
      const existsOtp=await ModelOtp.findOne({email,otp})
  if(existsOtp){
     await ModelNormal.insertOne({name,email,password}) 
     return res.json({mess:'go',name})
    } 
    else{
      return res.json({mess:'enter correct otp'})
    } 
}
server.put('/',async(req,res)=>{
   const {name,email,password,otp}=req.body
       await normal(res,req,name,email,password,otp)
})
server.put('/GoogleLogin',async(req,res)=>{
    const values=JSON.parse((new Buffer.from(((req.body.key).split('.'))[1],'base64')).toString())
    const found=await ModelGoogle.findOne({name:values.name,sub:values.sub,email:values.email})
    if(found){
        const sessionId=await ModelSid.insertOne({someId:found.id,name:found.name,TypeOfLoginSid:'ModelGoogle'})
     res.cookie('sid',sessionId.id,{
      httpOnly: true,
        sameSite:sameSite,
        secure:secure,
        signed:true,
         maxAge:60*1000*60
     })
       return  res.json({mess:'go',name:found.name})
    }
    else{
       const Id= await ModelGoogle.create({name:values.name,sub:values.sub,email:values.email})
       const sessionId=await ModelSid.insertOne({someId:Id.id,name:Id.name,TypeOfLoginSid:'ModelGoogle'})
     res.cookie('sid',sessionId.id,{
      httpOnly: true,
        sameSite:sameSite,
        secure:secure,
        signed:true,
         maxAge:60*1000*60
     })
     return res.json({mess:'go',name:Id.name})
    }
})
export default server