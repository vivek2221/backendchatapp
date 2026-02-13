import express from "express";
import { ModelGoogle, ModelNormal, ModelSid } from "../mongooseShema.js";
import { emailSchema, passwordSchema } from "../zodSchemaValidation/zodValidation.js";
import 'dotenv/config'
const sameSite=process.env.SAME_SITE
const secure=(process.env.SECURE==='true')
const server = express.Router()
server.post('/',async(req,res)=>{
     const cookies=req.signedCookies.sid
     const {email:Email,password:Password}=req.body
     let email=emailSchema.safeParse(Email)
     let password=passwordSchema.safeParse(Password)
     if(password.success && email.success){
      password=password.data;
      email=email.data;
     }
     else{
      return res.status(401).json({mess:'invalid Credentials'})
     }
     const findingsid=await ModelSid.findOne({_id:cookies})
     if(findingsid){
        return res.json({mess:'go',name:findingsid.name})
     }
     else{
        const found = await ModelNormal.findOne({email,password}) || await ModelGoogle.findOne({email,password})
        if(found){
         const whereFinded=await ModelNormal.findOne({email,password})

         await ModelSid.deleteMany({someId:found.id})
        const sessionId=await ModelSid.insertOne({someId:found.id,name:found.name,TypeOfLoginSid:whereFinded===null?'ModelGoogle':'ModelNormal'})
     res.cookie('sid',sessionId._id,{
      httpOnly:true,
        sameSite:sameSite,
        secure:secure,
        signed:true,
         maxAge:60*1000*60*10
     })
        return res.json({mess:'go',name:found.name})
   }
    else{
        return res.json({mess:'invalid credentials'})
    }
     }
})

export default server