import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import appRoutes from "./routes/index.routes.js";
import { PORT } from "./configs/server.config.js";
import { connectDB } from "./configs/database.config.js";
import {app,server} from "./configs/socket.config.js"

// const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "10mb", extended: true })); 
app.use(cookieParser());
app.use(express.json());
app.use("/api", appRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
