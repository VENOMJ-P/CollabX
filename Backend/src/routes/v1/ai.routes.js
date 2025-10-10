import express from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { getResult } from "../../controllers/ai.controller.js";

const router = express.Router();

router.get("/get-result", protectRoute, getResult);

export default router;
