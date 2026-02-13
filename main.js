import express from 'express'
import cors from 'cors'
import signUpRoute from './login routes/signUp.js'
import cookieParser from 'cookie-parser'
import loginInRoute from './login routes/login.js'
import friendsListRoute from './login routes/friendsListRoute.js'
import pending from './login routes/pendingReq.js'
import connectionsTOMe from './login routes/connectionsTOMe.js'
import beginData from './login routes/BeginData.js'
import  rejectReq  from './login routes/rejectReq.js'
import logout from './login routes/logout.js'
import {app,httpServer} from './websocket.js'
import 'dotenv/config'
import auth from './login routes/auth.js'

app.set('trust proxy', 1)
app.use(cors({
    origin:process.env.uiUrl,
    credentials:true
}))
app.use(express.json())
app.use(cookieParser(process.env.SECRET))
app.use('/signUp',signUpRoute)
app.use('/logout',logout)
app.use('/login',loginInRoute)
app.use('/pendingReq',auth,pending)
app.use('/connectionTOMe',auth,connectionsTOMe)
app.use('/beginChat',auth,beginData)
app.use('/allUsers',auth,friendsListRoute)
app.use('/rejectReq',auth,rejectReq)

httpServer.listen((process.env.Port || 10000),process.env.urlCommon,()=>{
    console.log(`server started on port ${process.env.Port}`)
})