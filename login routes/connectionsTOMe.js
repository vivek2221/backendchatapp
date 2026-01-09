import express from 'express'
import { Modelconnections } from '../mongooseShema.js'
const server = express.Router()
server.get('/:nameMine',async(req,res)=>{
    const {nameMine}=req.params
    const all=await Modelconnections.find({a:nameMine})
    const allToS=await Modelconnections.find({b:nameMine})
    const arrAll=all.map(({b})=>b)
    const arrAllToS=allToS.map(({a})=>a)
    const arr=[]
    arrAll.forEach((ele)=>{
        arr.push(ele)
    }) 
    arrAllToS.forEach((ele)=>{
        arr.push(ele)
    }) 
    res.status(200).json({arr})
})


export default server