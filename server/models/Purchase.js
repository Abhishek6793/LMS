import mongoose from 'mongoose'

const PurchaseSchema=new mongoose.Schema({
    courseId:{type:mongoose.Schema.Types.ObjectId,
        ref:'Course', //reference is Course Model
        required:true
    },
    userId:{
        type:String,
        ref:'User',  //reference from user schema
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['pending','completed','failed'],
        default:'pending'
    }

},{timestamps:true});

const Purchase=mongoose.model('Purchase',PurchaseSchema)

export default Purchase