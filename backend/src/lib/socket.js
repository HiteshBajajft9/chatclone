import { Server } from "socket.io";
import { ENV } from "./env.js";
import express from "express";
import http from "http";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to check for valid tokens before allowing socket connections

io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; //userId:socketId

io.on("connection", (socket) => {
  console.log("New client connected:", socket.user.username);
  //user can be accessed because of middleware that adds user info to socket object after verifying token
  const userId = socket.userId;

  userSocketMap[userId] = socket.id;

  // used to send event to all connected clients except the one that triggered the event
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // send list of online userIds to all clients

  // with socket.on we can listen for events from clients, in this case we listen for "sendMessage" event which is emitted by client when user sends a message
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.user.username);
    delete userSocketMap[userId]; // remove user from online list on disconnect
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // update online users for all clients
  });
});

export { io, app, server };
