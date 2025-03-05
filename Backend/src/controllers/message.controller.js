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
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_images",
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return errorResponse(res, 500, "Failed to upload image");
      }
    }

    // Check if the message starts with "@ai"
    if (text && text.startsWith("@ai")) {
      const aiPrompt = text.replace("@ai", "").trim(); // Remove "@ai" from the input

      // Generate AI response using Gemini
      const aiResponse = await generateResult({
        prompt: aiPrompt,
        image: image,
      });

      // Add AI-generated content to the message
      const newAIResponse = new Message({
        senderId: AI_ID, // Sender is the user making the request
        projectId,
        text: aiResponse,
        image: null, // AI response will likely not include images unless explicitly generated
      });

      await newAIResponse.save();

      console.log(aiResponse);
      const populatedMessage = await Message.findById(
        newAIResponse._id
      ).populate("senderId", "fullName profilePic email");

      io.to(projectId).emit("newMessage", populatedMessage);

      return successResponse(
        res,
        201,
        "AI response generated and sent successfully",
        newAIResponse
      );
    }

    // Normal message flow
    const newMessage = new Message({
      senderId,
      projectId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Populate sender info
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName profilePic email"
    );

    io.to(projectId).emit("newMessage", populatedMessage);

    return successResponse(
      res,
      201,
      "Message sent successfully",
      populatedMessage
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return errorResponse(res, 500, "Something went wrong", error);
  }
};
