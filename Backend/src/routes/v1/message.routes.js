import express from "express";

import { protectRoute } from "../../middlewares/auth.middleware.js";
import {
  getUsersForSideBar,
  getMessages,
  sendMessage,
} from "../../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:projectId", protectRoute, sendMessage);

export default router;
