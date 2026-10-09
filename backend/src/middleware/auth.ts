import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../config/logger";
import User, { IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.warn("Access attempt without authorization token.");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.warn(`Decoded user ID ${decoded.id} not found in database.`);
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (user.role === "doctor" && user.status !== "approved") {
      logger.warn(`Doctor account ${user.email} attempted access without approval (Status: ${user.status}).`);
      return res.status(403).json({ message: "Doctor account pending approval or deactivated" });
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error(`Token authentication error: ${error.message}`);
    return res.status(401).json({ message: "Not authorized, token expired or invalid" });
  }
};

export const restrictTo = (...roles: ("patient" | "doctor" | "admin")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(
        `User ${req.user?.email || "anonymous"} with role ${req.user?.role || "none"} attempted accessing forbidden resource.`
      );
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
