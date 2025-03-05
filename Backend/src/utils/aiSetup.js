import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_AI_KEY } from "../configs/server.config.js";
import { SYSTEM_INSTRUCTION } from "../configs/ai.prompt.js";

const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:SYSTEM_INSTRUCTION
 });

export const generateResult=async(prompt)=>{
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
}



