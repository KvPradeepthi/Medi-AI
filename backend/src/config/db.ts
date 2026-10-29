import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    logger.error("Database connection failed: MONGO_URI is not defined.");
    return;
  }

  const attempt = async () => {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
      logger.error(`Database connection error: ${error.message}. Retrying in 5 seconds...`);
      setTimeout(attempt, 5000);
    }
  };

  attempt();
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
  } catch (error: any) {
    logger.error(`Error closing MongoDB: ${error.message}`);
  }
};
