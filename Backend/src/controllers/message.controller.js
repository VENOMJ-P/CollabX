import cloudinary from "../configs/cloudinary.config.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

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
      .populate("senderId", "fullName profilePic") // Fetch only needed fields
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

    let imageUrl;
    if (image) {
      const uploadReponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadReponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      projectId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id)
    .populate("senderId", "fullName profilePic");
    
    return successResponse(res, 201, "Successfully sent a message", populatedMessage);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};
