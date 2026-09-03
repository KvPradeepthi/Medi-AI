import winston from "winston";
import path from "path";
import { env } from "./env";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/error.log"), 
      level: "error" 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/combined.log") 
    }),
  ],
});

// If in development, log to console as well with colors
if (env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      ),
    })
  );
}
