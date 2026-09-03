import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    logger.error("Database connection failed: MONGO_URI is not defined.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
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
