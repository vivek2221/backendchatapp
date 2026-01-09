import express from 'express'
import {Modelconnections,ModelDataAll} from '../mongooseShema.js'
const server = express.Router()
server.get('/:from/:to',async(req,res)=>{
  const {from,to}=req.params
  const idFinding=await Modelconnections.findOne({a:from,b:to}) || await Modelconnections.findOne({b:from,a:to})
  const AllData=await ModelDataAll.find({searchId:idFinding._id})
  const arr=AllData.map(({from,msg,timeAT})=>{return {from,msg,timeAT}})
    res.json({arr})
})

export default server