import { WebServiceClient } from "@maxmind/geoip2-node";
import { BrowserType, DeviceType, OSType } from "@prisma/client";
import { Job, Worker } from "bullmq";
import { UAParser } from "ua-parser-js";
import { ClickJobData } from "../../types/type";
import { config } from "../config";
import { prisma } from "../prisma";
import { redisClient } from "../services/redis";

type Location = { country: string | null; city: string | null };

const fetchCityAndCountry = async (ip: string): Promise<Location> => {
  let data: Location = { country: null, city: null };
  try {
    const AccountID = config.AccountID;
    const LicenseKey = config.LicenseKey;
    if (!AccountID || !LicenseKey)
      throw new Error("MaxMind credentials missing");

    const client = new WebServiceClient(AccountID, LicenseKey);
    const response = await client.city(ip);
    data = {
      country: response.country?.names.en || null,
      city: response.city?.names.en || null,
    };
  } catch (error) {
    console.warn(`Failed to fetch geolocation for IP ${ip}:`, error);
  }
  return data;
};

const clickProcessor = async (job: Job<ClickJobData>) => {
  const { aliasId, ip, referrer, userAgent, totalClickCount } = job.data;

  try {
    // Fetch city and country from IP
    const { country, city } = await fetchCityAndCountry(ip);

    // Parse user agent
    const parser = new UAParser(userAgent);
    const browserName = parser.getBrowser().name?.toUpperCase();
    const osName = parser.getOS().name?.toUpperCase();
    const deviceType = parser.getDevice().type?.toUpperCase();

    const browser = mapBrowserType(browserName);
    const os = mapOSType(osName);
    const device = mapDeviceType(deviceType);

    // Record the individual click
    await prisma.clickAnalytics.create({
      data: {
        aliasId,
        ipAddress: ip,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country,
        city,
        browser,
        os,
        device,
      },
    });

    // Aggregate data for publishing
    const totalClicks = totalClickCount;

    const analyticsPayload = {
      aliasId,
      totalClicks,
      browser,
      os,
      device,
    };

    // Publish to Redis
    await redisClient.publish(
      config.clickChannel,
      JSON.stringify(analyticsPayload)
    );
    console.log("Published click analytics:", analyticsPayload);
  } catch (error) {
    console.error("Error processing click job:", error);
    throw error; // For BullMQ retries
  }
};

const worker = new Worker<ClickJobData>("clickQueue", clickProcessor, {
  connection: redisClient,
  concurrency: 5,
  // attempts: 3,
  // backoff: { type: "exponential", delay: 1000 },
  limiter: { max: 100, duration: 60000 },
});

worker.on("failed", (job, err) => {
  console.error(
    // `Job ${job.id} failed after ${job.attemptsMade} attempts:`,
    `Job processing failed`,
    err
  );
});

function mapBrowserType(browser: string | undefined): BrowserType | null {
  if (!browser) return null;
  const browserMap: Record<string, BrowserType> = {
    CHROME: "CHROME",
    FIREFOX: "FIREFOX",
    EDGE: "EDGE",
    SAFARI: "SAFARI",
    OPERA: "OPERA",
  };
  return browserMap[browser] || "OTHER";
}

function mapOSType(os: string | undefined): OSType | null {
  if (!os) return null;
  const osMap: Record<string, OSType> = {
    WINDOWS: "WINDOWS",
    MAC: "MAC",
    LINUX: "LINUX",
    IOS: "IOS",
    ANDROID: "ANDROID",
  };
  return osMap[os] || "OTHER";
}

function mapDeviceType(device: string | undefined): DeviceType | null {
  if (!device) return null;
  const deviceMap: Record<string, DeviceType> = {
    MOBILE: "MOBILE",
    TABLET: "TABLET",
    DESKTOP: "DESKTOP",
  };
  return deviceMap[device] || null;
}
