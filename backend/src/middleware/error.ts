import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { env } from "../config/env";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(statusCode).json({
    message: err.message,
    stack: env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
