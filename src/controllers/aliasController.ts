import { Request, Response } from "express";
import Redis from "ioredis";
import APIError from "../errors/APIError";
import { prisma } from "../prisma";
import { trackClick } from "../queues/queue";
import { decodeBase62, encodeBase62 } from "../utils/shortURL";

const redis = new Redis();

const fetchAllAlias = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const aliasRecords = await prisma.alias.findMany({
      where: {
        userId,
      },
      include: {
        longURL: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        aliases: aliasRecords.map((aliasRecord) => ({
          aliasId: aliasRecord.id,
          alias: aliasRecord.alias,
          clickCount: aliasRecord.clickCount,
          URLId: aliasRecord.longURLId,
          longURL: aliasRecord.longURL.originalUrl,
        })),
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        errorCode: error.errorCode,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

const createAlias = async (req: Request, res: Response) => {
  try {
    let { longURL, customAlias }: { longURL: string; customAlias?: string } =
      req.body;
    const userId = req.user?.userId;
    console.log(userId);

    if (!longURL) {
      throw new APIError(400, "URL cannot be empty", "URL_MISSING");
    }

    // If the URL does not include a protocol, prepend "https://"
    if (!/^https?:\/\//i.test(longURL)) {
      longURL = "https://" + longURL;
    }

    // Validate that the URL is well-formed
    try {
      new URL(longURL);
    } catch (err) {
      throw new APIError(400, "Invalid URL format", "INVALID_URL");
    }

    await prisma.$transaction(async (tx) => {
      // Check if custom alias already exists
      if (customAlias) {
        const existingAlias = await tx.alias.findUnique({
          where: { alias: customAlias },
        });
        if (existingAlias) {
          throw new APIError(400, "Alias already exists", "ALIAS_EXISTS");
        }
      }

      // Upsert the long URL record
      const longURLRecord = await tx.longURL.upsert({
        where: { originalUrl: longURL },
        create: { originalUrl: longURL },
        update: {},
      });

      // Create alias record with a placeholder (empty string)
      // We need the generated aliasRecord.id for encoding into a short code.
      const aliasRecord = await tx.alias.create({
        data: {
          longURLId: longURLRecord.id,
          userId,
        },
      });

      // Use the custom alias if provided; otherwise, generate using aliasRecord.id
      const shortCode = customAlias || encodeBase62(aliasRecord.id);

      // Update the alias record with the final short code
      const updatedAlias = await tx.alias.update({
        where: { id: aliasRecord.id },
        data: { alias: shortCode },
      });

      res.status(201).json({
        status: "success",
        message: "Alias created successfully",
        data: {
          alias: updatedAlias,
          longURL: longURLRecord,
        },
      });
    });
  } catch (error) {
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
      message: "An unexpected error occurred",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

const redirectAlias = async (req: Request, res: Response) => {
  try {
    const ip = req.ip || "unknown";
    const referrer = req.get("Referrer") || "Direct";
    const userAgent = req.get("User-Agent") || "unknown";

    const { shortURL } = req.params;

    const aliasId = decodeBase62(shortURL);
    console.log(shortURL, aliasId);

    const cachedURL = await redis.get(`alias:${shortURL}`);
    if (cachedURL) {
      const aliasRecord = await prisma.alias.update({
        where: { alias: shortURL },
        data: {
          clickCount: { increment: 1 },
        },
      });
      trackClick({
        aliasId: aliasRecord.id,
        ip,
        referrer,
        userAgent,
        totalClickCount: aliasRecord.clickCount,
      });
      res.redirect(301, cachedURL);
      return;
    }

    const aliasRecord = await prisma.alias.findFirst({
      where: {
        OR: [{ id: aliasId }, { alias: shortURL }],
      },
      include: {
        longURL: true,
      },
    })


    if (!aliasRecord) {
      throw new APIError(404, "Alias not found", "ALIAS_NOT_FOUND");
    }

    trackClick({
      aliasId,
      ip,
      referrer,
      userAgent,
      totalClickCount: aliasRecord.clickCount,
    });

    await redis.set(`alias:${shortURL}`, aliasRecord.longURL.originalUrl);

    res.redirect(301, aliasRecord.longURL.originalUrl);
    return;
  } catch (error) {
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
      message: "An unexpected error occurred",
    });
    return;
  }
};

export { createAlias, fetchAllAlias, redirectAlias };
