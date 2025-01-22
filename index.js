import express from "express"
import dotenv from 'dotenv'
import userRouter from "./routes/user.route.js"
import postRouter from "./routes/post.route.js"
import commentRouter from "./routes/comment.route.js"
import webHookRouter from "./routes/webHook.route.js"
import connectDB from "./Lib/connectDB.js"
import { clerkMiddleware, requireAuth } from '@clerk/express'
import cors from 'cors'
import path from "path"
import { dirname } from "path"

dotenv.config()

const app = express()

app.use(cors(process.env.FRONT_END_URL))
app.use(clerkMiddleware())
app.use("/webhooks", webHookRouter)
app.use(express.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
      "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  

// app.get("/auth-state",(req,res)=>{
//     const authState = req.auth;
//     res.json(authState)
// })

// app.get("/protect",(req,res)=>{
//     const {userId} = req.auth;
//     if(!userId){
//         return res.status(401).send("not Authenticated")
//     }
//     res.status(200).send("content")
// })

// app.get("/protect2", requireAuth(), (req,res)=>{
//     res.status(200).send("content")
// })

app.use("/users", userRouter)
app.use("/posts", postRouter)
app.use("/comments", commentRouter)


app.use((error, req, res, next) =>{
    res.status(error.status || 500)
    res.json({
        message: error.message || "something went wrong",
        status: error.status,
        stack: error.stack
    })
})

app.listen(process.env.PORT, ()=>{
    connectDB()
    console.log(`server is running in the port ${process.env.PORT}`)
})