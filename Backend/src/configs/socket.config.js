import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Maps userId -> socket IDs (because a user can have multiple connections)
const userSocketMap = {};
// Maps projectId -> Set of userIds (Tracks online users per project)
const projectUsersMap = {};
// Maps userId -> Set of projectIds (Tracks projects a user is active in)
const userProjectMap = {};

// Store recent messages per project (optional, for new users joining)
const recentMessages = {};
const MESSAGE_HISTORY_LIMIT = 50;

export const getProjectId = (userId) => {
  return userProjectMap[userId] ? Array.from(userProjectMap[userId]) : [];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const { userId, projectId } = socket.handshake.query;
  
  if (userId && projectId) {
    // Track user sockets
    if (!userSocketMap[userId]) userSocketMap[userId] = [];
    userSocketMap[userId].push(socket.id);
    
    // Track user -> projects mapping
    if (!userProjectMap[userId]) userProjectMap[userId] = new Set();
    userProjectMap[userId].add(projectId);
    
    // Track project -> users mapping
    if (!projectUsersMap[projectId]) projectUsersMap[projectId] = new Set();
    projectUsersMap[projectId].add(userId);
    
    // Join the user to the project room
    socket.join(projectId);
    
    // Notify all users in the project about updated online users
    io.to(projectId).emit("getOnlineUsers", Array.from(projectUsersMap[projectId]));
    
    // Send recent messages to newly connected user
    if (recentMessages[projectId]) {
      socket.emit("recentMessages", recentMessages[projectId]);
    }
  }
  
  
  // Handle user typing status
//   socket.on("typing", (data) => {
//     const { projectId, userId, isTyping } = data;
//     socket.to(projectId).emit("userTyping", { userId, isTyping });
//   });
  
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      // Remove the socket from user's list
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
      
      // Remove user from projects only if they have no active sockets
      if (userProjectMap[userId] && userSocketMap[userId]?.length === 0) {
        userProjectMap[userId].forEach((projId) => {
          if (projectUsersMap[projId]) {
            projectUsersMap[projId].delete(userId);
            if (projectUsersMap[projId].size === 0) {
              delete projectUsersMap[projId];
            }
            // Notify remaining users in the project
            io.to(projId).emit("getOnlineUsers", Array.from(projectUsersMap[projId]));
          }
        });
        // Remove user from project mapping
        delete userProjectMap[userId];
      }
    }
  });
});
export { io, server, app };
