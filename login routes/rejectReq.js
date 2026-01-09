import { ModelPendingReq } from "../mongooseShema.js"
import express from 'express'
const server=express.Router()
server.delete('/',async(req,res)=>{
    const {from,to}=req.body
    await ModelPendingReq.deleteOne({from,to})
    res.status(200).json({mess:'done'})
})
export default server