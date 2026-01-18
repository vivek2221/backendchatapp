import { ModelPendingReq } from "../mongooseShema.js"
import express from 'express'
const server=express.Router()
server.delete('/',async(req,res)=>{
    const {from,to}=req.body
    await ModelPendingReq.deleteMany({$or:[{from,to},{to,from}]})
    res.status(200).json({mess:'done'})
})
export default server