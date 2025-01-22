import express from "express"
import bodyParser from "body-parser"
import { clerkWebHook } from "../controllers/webhookController.js"

const router = express.Router()

router.post("/clerk", 
    bodyParser.raw({ type: 'application/json' }), 
    clerkWebHook
)

export default router