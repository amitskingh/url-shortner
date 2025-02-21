import app from "./app";
import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";

const pub = new Redis();
const sub = new Redis();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

sub.subscribe("analyticsChannel");

sub.on("message", (channel, message) => {
  io.emit("analyticsUpdate", JSON.parse(message)); // Send to all clients
});

server.listen(3001, () => console.log("WebSocket running on 3001"));



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
