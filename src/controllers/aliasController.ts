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
    const { longURL, customAlias }: { longURL: string; customAlias: string } =
      req.body;
    const { userId } = req.user;

    if (!longURL) {
      throw new APIError(400, "URL cannot be empty", "URL_MISSING");
    }

    if (customAlias) {
      const aliasRecord = await prisma.alias.findUnique({
        where: {
          alias: customAlias,
        },
      });

      if (aliasRecord) {
        throw new APIError(400, "Alias already exists", "ALIAS_EXISTS");
      }
    }

    await prisma.$transaction(async (tx) => {
      const longURLRecord = await tx.longURL.upsert({
        where: {
          originalUrl: longURL,
        },
        create: {
          originalUrl: longURL,
        },
        update: {},
      });

      longURLRecord.id;

      const aliasRecord = await tx.alias.create({
        data: {
          longURLId: longURLRecord.id,
          userId,
        },
      });

      const shortCode = customAlias || encodeBase62(aliasRecord.id);

      const updatedAlias = await tx.alias.update({
        where: { id: aliasRecord.id },
        data: {
          alias: shortCode,
        },
      });

      res.status(201).json({
        status: "success",
        message: "Alias created successfully",
        data: {
          alias: updatedAlias.alias,
          longURL: longURLRecord.originalUrl,
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
    });
    return;
  }
};

const redirectAlias = async (req: Request, res: Response) => {
  try {
    const ip = req.ip || "unknown";
    const referrer = req.get("Referrer") || "Direct";
    const userAgent = req.get("User-Agent") || "unknown";

    const { shortURL } = req.params;

    const aliasId = decodeBase62(shortURL);

    const cachedURL = await redis.get(`alias:${aliasId}`);
    if (cachedURL) {
      const aliasRecord = await prisma.alias.update({
        where: { id: aliasId },
        data: {
          clickCount: { increment: 1 },
        },
      });
      trackClick({
        aliasId,
        ip,
        referrer,
        userAgent,
        totalClickCount: aliasRecord.clickCount,
      });
      res.redirect(301, cachedURL);
      return;
    }

    const aliasRecord = await prisma.alias.findUnique({
      where: {
        id: aliasId,
      },
      include: {
        longURL: true,
      },
    });

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

    await redis.set(`alias:${aliasId}`, aliasRecord.longURL.originalUrl);

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

