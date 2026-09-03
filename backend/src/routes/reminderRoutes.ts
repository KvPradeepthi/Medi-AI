import { Router } from "express";
import { ReminderController } from "../controllers/ReminderController";
import { protect } from "../middleware/auth";

const router = Router();
const controller = new ReminderController();

/**
 * @openapi
 * /reminders:
 *   post:
 *     summary: Patient registers custom medicine logs
 *     tags: [Reminders]
 */
router.post("/", protect, controller.add);

/**
 * @openapi
 * /reminders:
 *   get:
 *     summary: Fetch patient reminders list and compliance
 *     tags: [Reminders]
 */
router.get("/", protect, controller.get);

/**
 * @openapi
 * /reminders/{id}/log:
 *   patch:
 *     summary: Check/uncheck taken status for slot
 *     tags: [Reminders]
 */
router.patch("/:id/log", protect, controller.updateLog);

/**
 * @openapi
 * /reminders/{id}:
 *   delete:
 *     summary: Delete medicine tracking schedule
 *     tags: [Reminders]
 */
router.delete("/:id", protect, controller.delete);

export default router;
