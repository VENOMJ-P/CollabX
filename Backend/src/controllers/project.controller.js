import mongoose from "mongoose";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { successResponse,errorResponse } from "../utils/responseHandler.js";

export const create=async (req,res) => {
    try {
        const {name}=req.body;
        const loggedInUserId=req.user.id;
        if(!name){
            return errorResponse(res,400,"Please enter all fields");
        }
        const project=await Project.findOne({name});
        if(project){
            return errorResponse(res,400,"Project already exists");
        }
        
        const newProject = new Project({
            name,
            users: [loggedInUserId]
        });
        await newProject.save();
        return successResponse(res,201,"Successfully created a new project",newProject);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error);
    }
}

export const getAll=async(req,res)=>{
    try {
        const id = req.user.id;
        
        const allUserProjects = await Project.find({ users: { $in: [id] } });

        return successResponse(res, 200, "Successfully retrieved all projects", allUserProjects);

    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error); 
    }
}


export const addUser = async (req, res) => {
    try {
        const { projectId, emails } = req.body;
        const userId=req.user.id;
        if (!projectId || !emails || !Array.isArray(emails)) {
            return errorResponse(res, 400, "Project ID and valid emails array are required.");
        }

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return errorResponse(res,400,"Invalid projectId");
        }

        // Find the project
        const project = await Project.findOne({ _id: projectId, users: { $in: [userId] } });

        if (!project) {
            return errorResponse(res, 404, "Project not found or user not authorized.");
        }


        // Find users by email
        const users = await User.find({ email: { $in: emails } }, "_id");
        if (!users.length) {
            return errorResponse(res, 404, "No users found with provided emails.");
        }

        const userIds = users.map(user => user._id);
        const newUsers = userIds.filter(id => !project.users.includes(id));

        if (newUsers.length === 0) {
            return errorResponse(res, 400, "Users are already part of the project.");
        }

        project.users.push(...newUsers);
        await project.save();

        return successResponse(res, 200, "Users added successfully to the project", project);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error);
    }
};


export const getUsers=async(req,res)=>{
    try {
        const projectId=req.params.projectId;
        if(!projectId){
            return errorResponse(res,400,"Project Id is requried");
        }

        if(!mongoose.Types.ObjectId.isValid(projectId)){
            return errorResponse(res,400,"Invalid projectId");
        }

        const loggedInUserId = req.user.id;

        // Find the project and populate users
        const project = await Project.findById(projectId).populate("users", "fullName email profilePic ");

        if (!project) {
            return errorResponse(res, 404, "Project not found");
        }

        // Filter out the logged-in user
        const users = project.users.filter(user => user._id.toString() !== loggedInUserId);

        return successResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error);
    }
}