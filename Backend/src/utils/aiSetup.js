import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_AI_KEY } from "../configs/server.config.js";
import { SYSTEM_INSTRUCTION } from "../configs/server.config.js";

const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: SYSTEM_INSTRUCTION,
});

export const generateResult = async ({ prompt, image }) => {
  try {
    let image_prompt = null; // Default null instead of empty string

    if (image) {
      let imageData;
      if (Buffer.isBuffer(image)) {
        imageData = image.toString("base64");
      } else if (typeof image === "string" && image.startsWith("data:image")) {
        // Extract base64 data from data URI
        imageData = image.split(",")[1];
      } else {
        throw new Error(
          "Invalid image format. Expected Buffer or base64 string."
        );
      }

      image_prompt = {
        inlineData: {
          data: imageData,
          mimeType: "image/png", // Adjust based on input type
        },
      };
    }

    // Send text + optional image to AI model
    const inputPayload = image_prompt ? [prompt, image_prompt] : [prompt];
    console.log("input", inputPayload, prompt);
    const result = await model.generateContent(inputPayload);
    console.log("result", result);

    // Extract AI-generated response
    const generatedResponse = result?.response?.text();
    console.log("Generated Response:", generatedResponse);

    return generatedResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate response.");
  }
};
