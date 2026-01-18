import express from 'express'
import {ModelGoogle,ModelNormal,ModelSid} from '../mongooseShema.js'
import 'dotenv/config'
import { emailSchema, nameSchema, passwordSchema } from '../zodSchemaValidation/zodValidation.js'
const sameSite=process.env.SAME_SITE
const secure=(process.env.SECURE==='true')
const server=express.Router()
async function normal(res,name,email,password){
   const nameCheck=await ModelNormal.findOne({name,email})
      const nameCheckGoogle=await ModelGoogle.findOne({name,email})
      if(nameCheck || nameCheckGoogle){
         return res.json({mess:'user already exists'})
      }
     await ModelNormal.insertOne({name,email,password}) 
     return res.json({mess:'reLogin'}) 
}
server.put('/',async(req,res)=>{
   const {name:Name,email:Email,password:Password}=req.body
   let name=nameSchema.safeParse(Name);
   let email=emailSchema.safeParse(Email);
   let password=passwordSchema.safeParse(Password);
   if(name.success && password.success && email.success){
      name=name.data;
      password=password.data;
      email=email.data;
   }
   else{
      return res.status(401).json({mess:'enter correctly'})
   }
       await normal(res,name,email,password)
})
server.put('/GoogleLogin',async(req,res)=>{
    const values=JSON.parse((new Buffer.from(((req.body.key).split('.'))[1],'base64')).toString())
    const found=await ModelGoogle.findOne({name:values.name,sub:values.sub,email:values.email})
    if(found){
      await ModelSid.deleteMany({someId:found.id})
      const sessionId=await ModelSid.insertOne({someId:found.id,name:found.name,TypeOfLoginSid:'ModelGoogle'})
     res.cookie('sid',sessionId.id,{
      httpOnly: true,
        sameSite:sameSite,
        secure:secure,
        signed:true,
        maxAge:60*1000*60*10
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
           maxAge:60*1000*60*10
     })
     return res.json({mess:'go',name:Id.name})
    }
})
export default server