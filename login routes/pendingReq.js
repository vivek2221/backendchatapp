import express from 'express'
import { ModelPendingReq } from '../mongooseShema.js'
const server = express.Router()
server.put('/',async(req,res)=>{
    const data=await ModelPendingReq.find({to:req.body.name})
    const arr=data.map(({from})=>from)
    res.status(200).json({arr})
})
export default server