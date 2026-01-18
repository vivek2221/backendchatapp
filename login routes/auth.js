import { ModelSid } from "../mongooseShema.js"
import 'dotenv/config'

const auth=async (req,res,next)=>{ 
   const cookies=req.signedCookies.sid
   if(cookies){
     const findingsid=await ModelSid.findOne({_id:cookies})
     if(findingsid){
        next()
     }
     else{
        res.clearCookie('sid',{
         httpOnly:true,
         sameSite:process.env.SAME_SITE,
        secure:process.env.SECURE==='true',
        signed:true,
        })
        return res.json({mess:'reLogin'})
     }
   }
   else{
    return res.json({mess:'reLogin'})
   }
}
export default auth