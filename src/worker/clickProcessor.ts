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
  const { aliasId, ip, referrer, userAgent } = job.data;

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
    const totalClicks = await prisma.clickAnalytics.count({
      where: { aliasId },
    });

    const uniqueClicksData = await prisma.clickAnalytics.groupBy({
      by: ["ipAddress"],
      where: { aliasId, ipAddress: { not: "unknown" } },
      _count: {
        ipAddress: true,
      },
    });

    const uniqueClicks = uniqueClicksData.length;

    const countryStats = await prisma.clickAnalytics.groupBy({
      by: ["country"],
      where: { aliasId, country: { not: null } },
      _count: { _all: true },
    });
    const countries = countryStats.reduce((acc, curr) => {
      if (curr.country) acc[curr.country] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Referrers with counts
    const referrerStats = await prisma.clickAnalytics.groupBy({
      by: ["referrer"],
      where: { aliasId, referrer: { not: null } },
      _count: {
        referrer: true, // Count occurrences of referrer
      },
      orderBy: {
        _count: {
          referrer: "desc",
        },
      },
      take: 3,
    });

    const referrers = referrerStats.reduce((acc, curr) => {
      const key = curr.referrer || "Direct";
      acc[key] = curr._count.referrer;
      return acc;
    }, {} as Record<string, number>);

    // Devices with counts
    const deviceStats = await prisma.clickAnalytics.groupBy({
      by: ["device"],
      where: { aliasId, device: { not: null } },
      _count: {
        device: true,
      },
    });
    const devices = deviceStats.reduce((acc, curr) => {
      if (curr.device) acc[curr.device] = curr._count.device;
      return acc;
    }, {} as Record<string, number>);

    // Browsers with counts
    const browserStats = await prisma.clickAnalytics.groupBy({
      by: ["browser"],
      where: { aliasId, browser: { not: null } },
      _count: { browser: true },
    });
    const browsers = browserStats.reduce((acc, curr) => {
      if (curr.browser) acc[curr.browser] = curr._count.browser;
      return acc;
    }, {} as Record<string, number>);

    // Operating Systems with counts
    const osStats = await prisma.clickAnalytics.groupBy({
      by: ["os"],
      where: { aliasId, os: { not: null } },
      _count: { os: true },
    });

    const oses = osStats.reduce((acc, curr) => {
      if (curr.os) acc[curr.os] = curr._count.os;
      return acc;
    }, {} as Record<string, number>);

    // Construct the payload
    const analyticsPayload = {
      aliasId,
      totalClicks,
      uniqueClicks,
      countries,
      referrers,
      devices,
      browsers,
      os: oses,
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
