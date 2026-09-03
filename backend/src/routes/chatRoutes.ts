import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { protect } from "../middleware/auth";

const router = Router();
const controller = new ChatController();

/**
 * @openapi
 * /chats/recent-contacts:
 *   get:
 *     summary: Get list of active chat threads
 *     tags: [Chats]
 */
router.get("/recent-contacts", protect, controller.getRecentContacts);

/**
 * @openapi
 * /chats/history/{receiverId}:
 *   get:
 *     summary: Fetch text/media message history between two users
 *     tags: [Chats]
 */
router.get("/history/:receiverId", protect, controller.getHistory);

export default router;
