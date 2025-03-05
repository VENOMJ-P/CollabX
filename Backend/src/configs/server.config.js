import { config } from "dotenv";

config();

export const PORT = process.env.PORT;
export const MONGODB_URL = process.env.MONGODB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
export const AI_ID = process.env.AI_ID;
