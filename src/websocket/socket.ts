import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "../config";
import { redisSubscriber } from "../services/redis";

export const setupWebSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  redisSubscriber.on("message", (channel: string, message: string) => {
    if (channel === config.clickChannel) {
      try {
        const data = JSON.parse(message);
        // Assuming aliasId is passed elsewhere (e.g., via job metadata or Redis key)
        // For now, we'll need the aliasId to be included in the payload
        io.to(data.aliasId).emit("clickUpdate", data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (aliasId) => {
      console.log(`${socket.id} joined room ${aliasId}`);
      socket.join(aliasId);
    });

    socket.on("leave", (aliasId) => {
      console.log(`${socket.id} left room ${aliasId}`);
      socket.leave(aliasId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
