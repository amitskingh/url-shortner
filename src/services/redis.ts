import Redis from "ioredis";
import { config } from "../config";

// Create Redis client for commands (publisher)
export const redisClient = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null, // Retry on failure
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000); // Exponential backoff, max 2s
    return delay;
  },
});

// Create a separate Redis client for subscribing (Redis requires a dedicated connection for pub/sub)
export const redisSubscriber = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Function to verify Redis connection
async function verifyConnection(client: Redis, clientName: string) {
  try {
    await client.ping(); // Test connection with PING command
    console.log(`${clientName} connected to Redis successfully`);
  } catch (error) {
    console.error(`${clientName} failed to connect to Redis:`, error);
    process.exit(1); // Exit process if connection fails (optional)
  }
}

// Handle connection errors
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisSubscriber.on("error", (err) => {
  console.error("Redis Subscriber Error:", err);
});

// Handle successful connection
redisClient.on("connect", () => {
  console.log("Redis Client connected");
});

redisSubscriber.on("connect", () => {
  console.log("Redis Subscriber connected");
});

// Example usage: Set and get a key
// async function testRedis() {
//   try {
//     // Set a key-value pair
//     await redisClient.set("testKey", "Hello, Redis!");
//     console.log("Set key 'testKey' successfully");

//     // Get the value
//     const value = await redisClient.get("testKey");
//     console.log("Retrieved value:", value);

//     // Example pub/sub
//     await redisSubscriber.subscribe("channel1");
//     console.log("Subscribed to channel1");

//     redisSubscriber.on("message", (channel, message) => {
//       console.log(`Received message on ${channel}: ${message}`);
//     });

//     // Publish a message
//     await redisClient.publish("channel1", "Test message from Redis!");
//   } catch (error) {
//     console.error("Error in Redis operations:", error);
//   }
// }

// // Verify connections and run test
// (async () => {
//   await verifyConnection(redisClient, "Redis Client");
//   await verifyConnection(redisSubscriber, "Redis Subscriber");
//   await testRedis();
// })();
