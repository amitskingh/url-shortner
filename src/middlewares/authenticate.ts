import { getAuth } from "firebase-admin/auth";
import { NextFunction, Request, Response } from "express";
import APIError from "../errors/APIError";
import { prisma } from "../prisma";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = req.headers.authorization?.split(" ")[1];
    // if (!token) {
    //   throw new APIError(401, "Unauthorize", "INVALID_TOKEN");
    // }

    // const decodedToken = await getAuth().verifyIdToken(token);
    // if (!decodedToken) {
    //   throw new APIError(401, "Invalid token", "INVALID_TOKEN");
    // }
    // const uid = decodedToken.uid;

    // const user = await prisma.user.findFirst({
    //   where: { firebaseId: uid },
    // });

    // if (!user) {
    //   throw new APIError(401, "Unauthorized", "USER_NOT_FOUND");
    // }

    // req.user = { userId: user.id };
    req.user = { userId: 1 };

    next();
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
      message: "Internal Server Error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
};

export default authenticate;
