import Project from "../models/project.model.js";
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
        
        const newProject=new Project ({name,loggedInUserId});
        await newProject.save();
        return successResponse(res,201,"Successfully created a new project",newProject);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error);
    }
}