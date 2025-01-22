import express from "express"
import { getUserSavedPosts, SavePost } from "../controllers/userController.js"

const router = express.Router()

router.get("/saved", getUserSavedPosts)
router.patch("/save", SavePost)


export default router