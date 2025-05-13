import cloudinary from "../configs/cloudinary.config.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io } from "../configs/socket.config.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { generateResult } from "../utils/aiSetup.js";
import { AI_ID } from "../configs/server.config.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    return successResponse(
      res,
      201,
      "Successfully fetched Users",
      filteredUsers
    );
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const messages = await Message.find({ projectId })
      .populate("senderId", "fullName profilePic email") // Fetch only needed fields
      .sort({ createdAt: 1 });

    return successResponse(
      res,
      200,
      "Successfully fetched all messages",
      messages
    );
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { image, text } = req.body;
    const { projectId } = req.params;
    const senderId = req.user.id;

    if (!text && !image) {
      return errorResponse(res, 400, "Message cannot be empty");
    }

    let imageUrl = null;

    // Upload image to Cloudinary if present
    if (image) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: "chat_images",
        });

        console.log("image:", uploadResult);
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return errorResponse(res, 500, "Image upload failed");
      }
    }

    // Create and save user message
    const newMessage = new Message({
      senderId,
      projectId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Populate sender details
    const userMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic email"
    );

    // Emit the message to all users in the project room
    io.to(projectId).emit("newMessage", userMessage);

    // Check if message is an AI prompt
    if (text && text.startsWith("@ai")) {
      const prompt = text.replace("@ai", "").trim();

      try {
        const aiResponse = await generateResult({
          prompt,
          image,
        });

        if (!aiResponse) {
          return errorResponse(res, 500, "AI failed to generate a response");
        }

        const aiMessage = new Message({
          senderId: AI_ID,
          projectId,
          text: aiResponse,
          image: null,
        });

        await aiMessage.save();

        const populatedAIMessage = await Message.findById(
          aiMessage._id
        ).populate("senderId", "fullName profilePic email");

        io.to(projectId).emit("newMessage", populatedAIMessage);
      } catch (aiErr) {
        console.error("AI generation error:", aiErr);
        return errorResponse(res, 500, "Failed to process AI message");
      }
    }

    return successResponse(res, 201, "Message sent successfully", userMessage);
  } catch (err) {
    console.error("Error in sendMessage:", err);
    return errorResponse(res, 500, "Internal server error", err);
  }
};
