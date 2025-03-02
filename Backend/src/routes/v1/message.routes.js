import express from "express";

import { protectRoute } from "../../middlewares/auth.middleware.js";
import {
  getUsersForSideBar,
  getMessages,
  sendMessage,
} from "../../controllers/message.controller.js";

const router = express.Router();

router.use("/users", protectRoute, getUsersForSideBar);
router.use("/:id", protectRoute, getMessages);

router.use("/send/:id", protectRoute, sendMessage);

export default router;
