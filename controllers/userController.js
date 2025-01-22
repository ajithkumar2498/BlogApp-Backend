import userModel from "../models/userModel.js"


export const getUserSavedPosts = async (req,res)=>{
    try {
          const clerkUserId = req.auth.userId

          if(!clerkUserId){
            return res.status(401).send({
                message:"user not authenticated"
            })
          }

          const user =  await userModel.findOne({clerkUserId})

          res.status(200).json(user.savedPosts)

    } catch (error) {
        res.status(400).send({
            message: "something went wrong" || error.message,
            error:true
        })
    }
}

export const SavePost = async (req,res)=>{
    try {
         
        const clerkUserId = req?.auth?.userId
        const postId = req?.body?.postId

          if(!clerkUserId){
            return res.status(401).send({
                message:"user not authenticated"
            })
          }

          const user =  await userModel.findOne({clerkUserId})

          const isSaved  =  user.savedPosts.some((p)=> p === postId)

          if(!isSaved){
            await userModel.findByIdAndUpdate(user._id, {
                $push: {savedPosts: postId},
            })
          }else{
            await userModel.findByIdAndUpdate(user._id, {
                $pull: {savedPosts: postId},
            })

          }
            setTimeout(()=>{
                res.status(200).json(isSaved ? "Post Saved" : "Post Unsaved")
            },3000)
    } catch (error) {
        res.status(400).send({
            message: "something went wrong" || error.message,
            error:true
        })
    }
}


