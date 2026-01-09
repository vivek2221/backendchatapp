import mongoose  from "mongoose";
await mongoose.connect(process.env.mongooseConnectionString)
const GoogleLoginSchema=new mongoose.Schema({
    name:String,
    email:String,
    sub:String
}
)
const directLoginSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:String,
    password:String
}) 
const sidSchema= new mongoose.Schema({
    name:String,
    someId:mongoose.Schema.ObjectId,
    TypeOfLoginSid:String,
    createdAt:{
        type:Date,
        default:Date.now,
        expires:60*10
    }
})
const reqPendingSchema=new mongoose.Schema({
    from:String,
    to:String,
})
const connectionSchema=new mongoose.Schema({
    a:String,
    b:String,
    aId:mongoose.Schema.ObjectId,
    bId:mongoose.Schema.ObjectId,
})
const dataAllSchema=new mongoose.Schema({
    searchId:mongoose.Types.ObjectId,
    from:String,
    to:String,
    msg:String,
    timeAT:{
        type:Date,
        default:Date.now,
        expires:60 * 60 * 24 * 3 
    }
})
const otpSchema=new mongoose.Schema({
    email:String,
    otp:Number,
    timeAt:{
        type:Date,
        default:Date.now,
        expires:60*5
    }
})
const ModelGoogle= mongoose.model('googleLogin',GoogleLoginSchema)
const ModelNormal= mongoose.model('normalLogin',directLoginSchema)
const ModelSid=mongoose.model('sid',sidSchema)
const ModelPendingReq=mongoose.model('pending',reqPendingSchema)
const Modelconnections=mongoose.model('connections',connectionSchema)
const ModelDataAll=mongoose.model('dataAll',dataAllSchema)
const ModelOtp=mongoose.model('otp',otpSchema)

export {
    ModelGoogle,
    ModelNormal,
    ModelSid,
    ModelPendingReq,
    Modelconnections,
    ModelDataAll,
    ModelOtp
}
process.on('SIGINT',async()=>{
   await  mongoose.disconnect()
    process.exit(0)
})