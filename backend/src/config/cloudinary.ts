import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "./logger";

const isConfigured = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  logger.info("Cloudinary client configured successfully.");
} else {
  logger.warn("Cloudinary credentials missing. Server will fall back to local file storage storage.");
}

export { cloudinary, isConfigured };
