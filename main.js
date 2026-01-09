import express from 'express'
import cors from 'cors'
import signUpRoute from './login routes/signUp.js'
import cookieParser from 'cookie-parser'
import loginInRoute from './login routes/login.js'
import friendsListRoute from './login routes/friendsListRoute.js'
import auth from './login routes/auth.js'
import pending from './login routes/pendingReq.js'
import connectionsTOMe from './login routes/connectionsTOMe.js'
import beginData from './login routes/BeginData.js'
import otp from './login routes/otp.js'
import  rejectReq  from './login routes/rejectReq.js'

const server = express()
server.set('trust proxy', 1)
server.use(cors({
    origin:`http://${process.env.uiUrl}:5173`,
    credentials:true
}))
server.use(express.json())
server.use(cookieParser('vivek'))
server.use('/otpChecking',otp)
server.use('/signUp',signUpRoute)
server.use('/login',loginInRoute)
server.use('/pendingReq',pending)
server.use('/connectionTOMe',connectionsTOMe)
server.use('/beginChat',beginData)
server.use('/allUsers',auth,friendsListRoute)
server.use('/rejectReq',rejectReq)
server.listen(process.env.serverPort,process.env.urlCommon,()=>{
    console.log(`server started on port ${process.env.serverPort}`)
})