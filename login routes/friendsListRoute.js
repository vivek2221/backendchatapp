import express from 'express'
import { Modelconnections, ModelGoogle, ModelNormal } from '../mongooseShema.js'

const server = express.Router()
server.get('/:name',async(req,res)=>{
   const {name:Nam}=req.params
   console.log(Nam)
   const data=await ModelGoogle.find().lean()
   const dataNormal=await ModelNormal.find().lean()
   let arr=[]
   data.forEach(ele=>{
    arr.push(ele.name)
   })
   dataNormal.forEach(ele=>{
    arr.push(ele.name)
   })
   arr=arr.filter((ele)=>ele!==Nam)
   let conn=await Modelconnections.find({$or:[{a:Nam},{b:Nam}]}).lean();
   let aConn=[]
   let bConn=[]
   conn.forEach((ele)=>{
      aConn.push(ele.a)
   })
   conn.forEach((ele)=>{
      bConn.push(ele.b)
   })
   aConn=aConn.filter((ele)=>ele!=Nam)
   bConn=bConn.filter((ele)=>ele!=Nam)
   aConn=[...aConn,...bConn]
 
   arr=arr.filter((ele)=>{
      if(!aConn.includes(ele)){
         console.log('running')
        return ele
      }
   })
   
   res.json({arr})
})

export default server