import { Queue } from "bullmq";
import { config } from "../config";
import { ClickJobData } from "../../types/type";

export const clickQueue = new Queue("clickQueue", {
  connection: {
    url: config.REDIS_URL,
  },
});

async function trackClick({
  aliasId,
  ip,
  referrer,
  userAgent,
  totalClickCount,
}: ClickJobData) {
  await clickQueue.add("trackClick", {
    aliasId,
    ip,
    referrer,
    userAgent,
    totalClickCount,
  });
}

export { trackClick };
