import postModel from "../models/postModel.js"
import userModel from "../models/userModel.js"
import ImageKit from "imagekit"


export const getPosts = async(req, res)=>{
   try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 2

    const query = {}
   
    
   const cat =  req.query.cat
   const author =  req.query.author
   const searchQuery =  req.query.search
   const sortQuery =  req.query.sort
   const featured =  req.query.featured

   if(cat){
    query.category = cat
   }
    if(searchQuery){
    query.title = {$regex:searchQuery, $options:"i"}
   }
    if(author){
      const user = await userModel.findOne({userName:author}).select("_id")
      if(!user){
        return res.status(404).send("no post found")
      }

      query.user = user._id
   }

  let sortObj ={ createdAt: -1}

   if(sortQuery){
    switch (sortQuery) {
        case "newest":
            sortObj ={ createdAt: -1}
            break;
        case "oldest":
            sortObj ={ createdAt: 1}
            break;
        case "popular":
            sortObj ={ visit: -1}
            break;
        case "trending":
            sortObj ={ visit: -1}
            query.createdAt = {
                $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 1000)
            }
            break;
        default:
            break;
    }
   }

   if(featured){
    query.isFeatured=true
   }

     const posts = await postModel.find(query)
     .populate("user","userName profileImg")
     .sort(sortObj)
     .limit(limit)
     .skip((page-1) * limit)

     const totalPosts = await postModel.countDocuments(query)
     const hasMore = page * limit < totalPosts

     res.status(200).send(
        {posts, hasMore})
   } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error. Unable to fetch posts." });
   }
}

export const getPost = async(req, res)=>{
    const post = await postModel.findOne({slug:req.params.slug}).populate("user","userName profileImg")
    res.status(200).send(post)
}

export const createPost = async(req, res)=>{

    const clerkUserId = req.auth.userId

    if(!clerkUserId){
        return res.status(401).json(
            {message: "Not Authenticated"}
        )
    }

    const user = await userModel.findOne({clerkUserId})

    if(!user){
        return res.status(404).json(
            {message: "User Not Found"}
        ) 
    }

    let slug = req.body.title.replace(/ /g, "-").toLowerCase()

    let existingPost = await postModel.findOne({slug})
     
    let counter = 2

   while (existingPost) {
  slug = `${req.body.title.replace(/ /g, "-").toLowerCase()}-${counter}`;
  existingPost = await postModel.findOne({ slug });
  counter++;
}

   const newPost = new postModel({user:user._id, slug, ...req.body})

    const post = await newPost.save()
    res.status(200).send(post)
}

export const deletePost = async(req, res)=>{

    const clerkUserId = req?.auth?.userId
    console.log("clerk id", clerkUserId)

    if(!clerkUserId){
        return res.status(401).json(
            {message: "Not Authenticaed"}
        )
    }
    const role = req.auth.sessionClaims?.metadata?.role || "user"

    if(role === "admin"){
        await postModel.findByIdAndDelete(req.params.id)
        return res.status(200).send("post has been deleted")
    }

    const user = await userModel.findOne({clerkUserId})
     const deletedPost = await postModel.findByIdAndDelete({
        _id:req.params.id,
        user: user._id
     })

     if(!deletedPost){
        res.status(403).send({
            message:"you can delete only your post!"
        })
     }
     res.status(200).send("post has been deleted")
 }


export const  featurePost = async(req, res)=>{
   try {
    const clerkUserId = req?.auth?.userId
    const postId = req.body.postId

    if(!clerkUserId){
        return res.status(401).json(
            {message: "Not Authenticaed"}
        )
    }
    const role = req.auth.sessionClaims?.metadata?.role || "user"

    if(role !== "admin"){
        return res.status(403).send("you cannot feature post!")
    }
      const post  = await postModel.findById(postId)

      if(!post){
        return res.status(404).send({
            message:"post not found"
        })
      }

      const isFeatured = postModel.isFeatured


      const updatedPost = await postModel.findByIdAndUpdate(
        postId,
        {
        isFeatured: !isFeatured
        },
        {new: true}
    )
     res.status(200).send(updatedPost)
   } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ message: "Server error. Unable to fetch posts." });
   }
 }


//  const imagekit = new ImageKit({
//     urlEndpoint: "https://ik.imagekit.io/lhqk4dwpb/" || process.env.IMAGEKIT_URL_ENDPOINT,
//     publicKey: "public_+hOK2ki/oJZ8Y4DD+zXOTSjo+fc=" || process.env.IMAGEKIT_PUBLIC_KEY,
//     privateKey: "private_dRGSOqFEHnusLGFKHL2i39Gbd7E=" || process.env.IMAGEKIT_PRIVATE_KEY
//   },
// );

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey:  process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
  });
  
export const uploadAuth = async (req, res)=>{
    var result = imagekit.getAuthenticationParameters();
    res.send(result)
 }

 