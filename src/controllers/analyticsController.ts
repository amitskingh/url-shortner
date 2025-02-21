import { Request, Response } from "express";
import { prisma } from "../prisma";
import APIError from "../errors/APIError";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const aliasId = Number(req.params.aliasId);

    if (!aliasId) {
      throw new APIError(404, "Invalid alias", "INVALID_ALIAS");
    }

    const { userId } = req.user;

    const aliasRecord = await prisma.alias.findUnique({
      where: { id: aliasId, userId: userId },
    });

    if (!aliasRecord) {
      throw new APIError(
        404,
        "Alias not found for this user",
        "ALIAS_NOT_FOUND"
      );
    }

    // Fetch total clicks
    const totalClicks = aliasRecord.clickCount;

    // Fetch unique clicks (distinct IPs)
    const uniqueClicksData = await prisma.clickAnalytics.groupBy({
      by: ["ipAddress"],
      where: { aliasId, ipAddress: { not: "unknown" } },
      _count: {
        ipAddress: true,
      },
    });

    const uniqueClicks = uniqueClicksData.length;

    // Fetch country statistics
    const countryStats = await prisma.clickAnalytics.groupBy({
      by: ["country"],
      where: { aliasId, country: { not: null } },
      _count: { _all: true },
    });

    const countries = countryStats.reduce((acc, curr) => {
      if (curr.country) acc[curr.country] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Fetch top referrers
    const referrerStats = await prisma.clickAnalytics.groupBy({
      by: ["referrer"],
      where: { aliasId, referrer: { not: null } },
      _count: { referrer: true },
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

    // Fetch device statistics
    const deviceStats = await prisma.clickAnalytics.groupBy({
      by: ["device"],
      where: { aliasId, device: { not: null } },
      _count: { device: true },
    });

    const devices = deviceStats.reduce((acc, curr) => {
      if (curr.device) acc[curr.device] = curr._count.device;
      return acc;
    }, {} as Record<string, number>);

    // Fetch browser statistics
    const browserStats = await prisma.clickAnalytics.groupBy({
      by: ["browser"],
      where: { aliasId, browser: { not: null } },
      _count: { browser: true },
    });

    const browsers = browserStats.reduce((acc, curr) => {
      if (curr.browser) acc[curr.browser] = curr._count.browser;
      return acc;
    }, {} as Record<string, number>);

    // Fetch OS statistics
    const osStats = await prisma.clickAnalytics.groupBy({
      by: ["os"],
      where: { aliasId, os: { not: null } },
      _count: { os: true },
    });

    const oses = osStats.reduce((acc, curr) => {
      if (curr.os) acc[curr.os] = curr._count.os;
      return acc;
    }, {} as Record<string, number>);

    // Construct the response payload
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

    res.json(analyticsPayload);
  } catch (error) {
    console.error("Error fetching analytics:", error);

    if (error instanceof APIError) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        errorCode: error.errorCode,
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};
