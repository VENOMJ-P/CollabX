import cloudinary from "../configs/cloudinary.config";
import Message from "../models/message.model";
import User from "../models/user.model";

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
    const { id: userToChatId } = req.params;
    const myId = req.user.id;
    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    return successResponse(
      res,
      200,
      "Successfully fetched all messages",
      message
    );
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { image, text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      const uploadReponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadReponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    return successResponse(res, 201, "Successfully sent a message", newMessage);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error);
  }
};
