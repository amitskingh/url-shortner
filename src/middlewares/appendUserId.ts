import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { prisma } from "../prisma";

export const appendUserdId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decodedToken = await getAuth().verifyIdToken(token);
      if (decodedToken) {
        const user = await prisma.user.findFirst({
          where: {
            firebaseId: decodedToken.uid,
          },
        });

        if (user) {
          req.user.userId = user.id;
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    next();
  }
};
