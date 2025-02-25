import express from "express";
import { Express } from "express";
import http from "http";
import { setupWebSocket } from "./websocket/socket";
import { app } from "./app";

const server = http.createServer(app);

setupWebSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("server listening on port");
});
