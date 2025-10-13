import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

import appRoutes from "./routes/index.routes.js";
import { CLIENT_URL, PORT } from "./configs/server.config.js";
import { connectDB } from "./configs/database.config.js";
import { app, server } from "./configs/socket.config.js";

// CORS Configuration - MUST be before routes
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://res.cloudinary.com",
      CLIENT_URL,
    ].filter(Boolean); // Remove undefined values

    console.log("Request origin:", origin);
    console.log("Allowed origins:", allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable preflight for all routes

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use("/api", appRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  console.log("Client URL:", CLIENT_URL);
  connectDB();
});
