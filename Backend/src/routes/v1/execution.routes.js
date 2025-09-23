import express from "express";
import { protectRoute } from "../../middlewares/auth.middleware.js";
import { executeCode, checkDockerStatus } from "../../controllers/execution.controller.js";

const router = express.Router();

router.post("/run", protectRoute, executeCode);

router.get("/docker-status", protectRoute, checkDockerStatus);

export default router;