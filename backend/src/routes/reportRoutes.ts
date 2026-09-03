import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ReportController } from "../controllers/ReportController";
import { protect } from "../middleware/auth";

const router = Router();
const controller = new ReportController();

// Configure local uploads folder creation dynamically
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * @openapi
 * /reports/upload:
 *   post:
 *     summary: Upload and process patient medical report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               reportType:
 *                 type: string
 *                 enum: [Blood Test, CBC, MRI, CT, ECG, X-Ray, Other]
 */
router.post("/upload", protect, upload.single("file"), controller.uploadReport);

/**
 * @openapi
 * /reports/history:
 *   get:
 *     summary: Retrieve patient report history logs
 *     tags: [Reports]
 */
router.get("/history", protect, controller.getHistory);

/**
 * @openapi
 * /reports/{id}:
 *   get:
 *     summary: Get detailed structured analysis report
 *     tags: [Reports]
 */
router.get("/:id", protect, controller.getReportDetails);

export default router;
