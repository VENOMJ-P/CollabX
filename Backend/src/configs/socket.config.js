import express from "express";
import http from "http";
import { Server } from "socket.io";
import Project from "../models/project.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Store active users in each project
const projectUsersMap = {};

// Middleware to validate project ID
io.use(async (socket, next) => {
  try {
    const { userId, projectId } = socket.handshake.query;
    console.log("Socket connection attempt with:", { userId, projectId });

    if (!userId || !projectId) {
      return next(new Error("Missing userId or projectId"));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    socket.userId = userId;
    socket.projectId = projectId;
    next();
  } catch (error) {
    console.error("Socket middleware error:", error);
    next(new Error("Internal server error"));
  }
});


io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected to project ${socket.projectId}`);

  // Join the user to the project room
  socket.join(socket.projectId);

  // Track online users
  if (!projectUsersMap[socket.projectId]) {
    projectUsersMap[socket.projectId] = new Set();
  }
  projectUsersMap[socket.projectId].add(socket.userId);

  // Send updated online user list
  io.to(socket.projectId).emit(
    "getOnlineUsers",
    Array.from(projectUsersMap[socket.projectId])
  );

  
  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);

    if (projectUsersMap[socket.projectId]) {
      projectUsersMap[socket.projectId].delete(socket.userId);
      
      // Emit before potentially deleting the Set
      io.to(socket.projectId).emit(
        "getOnlineUsers",
        Array.from(projectUsersMap[socket.projectId] || [])
      );

      if (projectUsersMap[socket.projectId].size === 0) {
        delete projectUsersMap[socket.projectId];
      }
    }
  });
});

export { io, server, app };
