import dotenv from "dotenv";
import path from "path";

// Load environment variables from working directory and root
dotenv.config();
dotenv.config({ path: path.join(__dirname, "../../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "mediai_default_secret_key_change_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
};

// Simple validation
const requiredKeys: (keyof typeof env)[] = [
  "MONGO_URI",
  "GEMINI_API_KEY"
];

const missingKeys = requiredKeys.filter((key) => !env[key]);

if (missingKeys.length > 0) {
  console.warn(`[WARNING] Missing critical environment variables: ${missingKeys.join(", ")}. Platform features might fail.`);
}
