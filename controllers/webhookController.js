// import userModel from "../models/userModel.js";
// import { Webhook } from "svix";

// export const clerkWebHook = async (req, res) => {
//     const WEBHOOK_SECRET = process.env.CLERK_WEB_HOOK_SECRET;
//     if (!WEBHOOK_SECRET) {
//       throw new Error("Webhook secret needed!");
//     }

//     // Initialize the Svix Webhook verifier
//     const wh = new Webhook(WEBHOOK_SECRET);

//     // Verify the webhook
//     let evt;
//     try {
//       evt = wh.verify(req.body, req.headers); // Ensure req.body is raw
//     } catch (err) {
//       return res.status(400).json({
//         message: "Webhook verification failed!",
//         error: true,
//         details: err.message,
//       });
//     }

//     console.log("Event Data:", evt.data);

//     // Handle specific event types
//     if (evt.type === "user.created") {
//       const newUser = new userModel({
//         clerkUserId: evt.data.id,
//         userName: evt.data.username || evt.data.email_addresses[0].email_address,
//         email: evt.data.email_addresses[0].email_address,
//         profileImg: evt.data.profile_image_url,
//       });

    
//         await newUser.save();
//         console.log("New user created:", newUser);
//     }

//     // Send success response
//     return res.status(200).json({
//       message: "Webhook processed successfully!",
//     });
// };
import userModel from "../models/userModel.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEB_HOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Webhook secret not configured!");
    return res.status(500).json({ message: "Internal server error", error: true });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(req.body, req.headers);
    console.log("Webhook event received:", evt.type);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({
      message: "Webhook verification failed!",
      error: true,
      details: err.message,
    });
  }

  if (evt.type === "user.created") {
    const { id, username, email_addresses, profile_image_url } = evt.data;

    if (!id || !email_addresses || email_addresses.length === 0) {
      console.error("Invalid webhook data:", evt.data);
      return res.status(400).json({
        message: "Invalid data: clerkUserId or email is missing",
        error: true,
      });
    }

    try {
      // Check if the user already exists
      const existingUser = await userModel.findOne({ clerkUserId: id });
      if (existingUser) {
        console.log("User already exists:", existingUser);
        return res.status(200).json({ message: "User already exists." });
      }

      // Create and save the user
      const newUser = new userModel({
        clerkUserId: id,
        userName: username || email_addresses[0].email_address,
        email: email_addresses[0].email_address,
        profileImg: profile_image_url,
      });

      const savedUser = await newUser.save();
      console.log("User saved to database:", savedUser);
      return res.status(200).json({ message: "User created successfully!" });
    } catch (err) {
      if (err.code === 11000) {
        console.error("Duplicate key error:", err);
        return res.status(400).json({ message: "Duplicate user data", error: true });
      }
      console.error("Error saving user:", err);
      return res.status(500).json({ message: "Failed to save user", error: true });
    }
  }

  console.log("Unhandled webhook event type:", evt.type);
  return res.status(200).json({
    message: "Webhook processed successfully!",
  });
};
  