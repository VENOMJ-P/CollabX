import { generateResult } from "../utils/aiSetup.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const getResult = async(req,res)=>{
    try {
        const {prompt="",image=null}=req.query;
        const data =await generateResult({prompt,image});
        return successResponse(res,200,"Successfully get result from ai",data);
    } catch (error) {
        return errorResponse(res,500,"Something went wrong",error);
    }
}