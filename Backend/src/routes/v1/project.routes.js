import express from 'express'
import { addUser, create, getAll,getUsers } from '../../controllers/project.controller.js';
import { protectRoute } from '../../middlewares/auth.middleware.js';

const router=express.Router();

router.post("/create",protectRoute,create);
router.get("/all",protectRoute,getAll);
router.get("/:projectId",protectRoute,getUsers);
router.put("/add-users",protectRoute,addUser);

export default router; 