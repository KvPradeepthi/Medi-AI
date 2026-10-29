import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    logger.error("Database connection failed: MONGO_URI is not defined.");
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Database connection error: ${error.message}`);
    logger.warn("Server will continue running so HTTP health and CORS endpoints remain operational.");
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
  } catch (error: any) {
    logger.error(`Error closing MongoDB: ${error.message}`);
  }
};
