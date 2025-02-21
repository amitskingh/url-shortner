import Redis from "ioredis";
import { config } from "../config";

export const redisClient = new Redis(config.REDIS_URL);
export const redisSubscriber = new Redis(config.REDIS_URL);

redisSubscriber.subscribe(config.clickChannel, (err) => {
  if (err) console.error("Failed to subscribe:", err);
  else console.log("Subscribed to Redis click updates.");
});

redisSubscriber.on("error", (err) => {
  console.error("Redis connection error:", err);
  process.exit(1);
});
