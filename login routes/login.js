import express from "express";
import { ModelNormal, ModelSid } from "../mongooseShema.js";
const sameSite='lax';
const secure=false;

const server = express.Router()
server.post('/',async(req,res)=>{
     const cookies=req.signedCookies.sid
     const {name,email,password}=req.body
     const findingsid=await ModelSid.findOne({_id:cookies})
     if(findingsid){
        return res.json({mess:'go',name:findingsid.name})
     }
     else{
        const found = await ModelNormal.findOne({name,email,password})
        if(found){
        const sessionId=await ModelSid.insertOne({someId:found.id,name,TypeOfLoginSid:'ModelNormal'})
     res.cookie('sid',sessionId.id,{
        sameSite:sameSite,
        secure:secure,
        signed:true,
         maxAge:60*1000*60*60*10
     })
        return res.json({mess:'go',name})

   }
    else{
        return res.json({mess:'invalid credentials'})
    }
     }
})

export default server