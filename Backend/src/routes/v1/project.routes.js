import express from 'express'
import { create } from '../../controllers/project.controller.js';
import { protectRoute } from '../../middlewares/auth.middleware.js';

const router=express.Router();

router.post("/create",protectRoute,create);

export default router; 