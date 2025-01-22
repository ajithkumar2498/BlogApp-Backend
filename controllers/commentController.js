import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"

export const getPostComments = async (req, res)=>{
    try {
        const comments = await commentModel.find({ post: req.params.postId })
        .populate("user", "userName profileImg")
        .sort({createdAt: -1})

        res.status(200).json(comments)

    } catch (error) {
        res.status(400).send({
            message: "something went wrong" || error.message,
            error:true
        })
    }
}
export const addComment = async (req, res)=>{
    try {
        const clerkUserId = req?.auth?.userId
        const postId = req.params.postId

         if(!clerkUserId){
            return res.status(401).send({
                message:"user Not Authenticated!"
            })
         }
    
         const user = await userModel.findOne({clerkUserId})

         if (!user) {
            return res.status(404).send({
                message: "User not found!",
            });
        }
         const newComment = new commentModel({
            ...req.body,
            user: user._id,
            post: postId
         })
         const savedComment = await newComment.save()
         
         setTimeout(()=>{
            res.status(201).send({
                message:"new comment Added",
                data:savedComment
             })
         }, 3000)
        
    } catch (error) {
        res.status(400).send({
            message: "something went wrong" || error.message,
            error:true
        })
    }
}
export const deleteComment = async (req, res)=>{
    try {
        const clerkUserId = req?.auth?.userId
        const id = req?.params?.id
         if(!clerkUserId){
            return res.status(401).send({
                message:"user Not Authenticated!"
            })
         }
         
         const role = req.auth.sessionClaims?.metadata?.role || "user"
         
             if(role === "admin"){
                 await commentModel.findByIdAndDelete(req.params.id)
                return  res.status(200).send("comment has been deleted")
             }

         const user = await userModel.findOne({clerkUserId})
    
         const deletedComment = await commentModel.findOneAndDelete({_id:id, user:user._id})
         
         if(!deletedComment){
            return res.status.send(403).send({
                message:"you can delete only your comment"
            })
         }
         res.status(200).send({
            message:"comment deleted"
         })
    } catch (error) {
        res.status(400).send({
            message: "something went wrong" || error.message,
            error:true
        })
    }
}