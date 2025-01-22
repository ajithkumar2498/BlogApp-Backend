import { Schema } from "mongoose";
import mongoose from "mongoose";


const commentSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId, 
        ref:"user", 
        required:true
    },
    post:{
        type:Schema.Types.ObjectId, 
        ref:"post", 
        required:true
    },
    desc:{
        type:String,
        required:true,
    }
    
},{timestamps:true});

export default  mongoose.model("comment",commentSchema)