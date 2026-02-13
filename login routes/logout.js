import express from "express";
import { ModelSid } from "../mongooseShema.js";
const server = express.Router()
const sameSite=process.env.SAME_SITE
const secure=(process.env.SECURE==='true')
server.delete('/',async(req,res)=>{
   const cookies=req.signedCookies.sid;
   res.clearCookie('sid',{
    httpOnly:true,
        sameSite:sameSite,
        secure:secure,
        signed:true,
         maxAge:60*1000*60*10
   })
   await ModelSid.deleteMany({_id:cookies})
   res.status(200).json({mess:'reLogin'})
})
export default server