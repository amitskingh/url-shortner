import { Request } from "express";
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number; // Add the user property to the Request interface
      };
    }
  }
}
