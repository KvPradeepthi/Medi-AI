import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();
const controller = new AppointmentController();

/**
 * @openapi
 * /appointments/book:
 *   post:
 *     summary: Patient bookings for slot
 *     tags: [Appointments]
 */
router.post("/book", protect, restrictTo("patient"), controller.book);

/**
 * @openapi
 * /appointments:
 *   get:
 *     summary: List scheduling logs for current user context
 *     tags: [Appointments]
 */
router.get("/", protect, controller.getAppointments);

/**
 * @openapi
 * /appointments/{id}/cancel:
 *   patch:
 *     summary: Reschedule or cancel slot
 *     tags: [Appointments]
 */
router.patch("/:id/cancel", protect, controller.cancel);

/**
 * @openapi
 * /appointments/{id}/complete:
 *   patch:
 *     summary: Complete consultation
 *     tags: [Appointments]
 */
router.patch("/:id/complete", protect, restrictTo("doctor"), controller.complete);

/**
 * @openapi
 * /appointments/{id}/prescribe:
 *   post:
 *     summary: Prescribe medication logs from doctor
 *     tags: [Appointments]
 */
router.post("/:id/prescribe", protect, restrictTo("doctor"), controller.prescribe);

export default router;
