import { Schema } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: { unique: true, partialFilterExpression: { clerkUserId: { $exists: true, $ne: null } } },
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      index: { unique: true, partialFilterExpression: { userName: { $exists: true, $ne: null } } },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null } } },
    },
    profileImg: {
      type: String,
    },
    savedPosts: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);


export default  mongoose.model("user",userSchema)