import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
       await mongoose.connect(process.env.DB_NAME) 
       console.log("mongodb is connected")
    } catch (error) {
       console.log(error) 
    }
}

export default connectDB