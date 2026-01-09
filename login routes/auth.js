import { ModelSid } from "../mongooseShema.js"

const auth=async (req,res,next)=>{ 
   const cookies=req.signedCookies.sid
   if(cookies){
     const findingsid=await ModelSid.findOne({_id:cookies})
     if(findingsid){
        next()
     }
     else{
        return res.json({mess:'not authorised'})
     }
   }
   else{
    return res.json({mess:'not authorised'})
   }
}
export default auth