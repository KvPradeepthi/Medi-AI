import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();
const controller = new UserController();

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get profile logs
 *     tags: [Users]
 */
router.get("/profile", protect, controller.getProfile);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update profile details
 *     tags: [Users]
 */
router.patch("/profile", protect, controller.updateProfile);

/**
 * @openapi
 * /users/patient-dashboard:
 *   get:
 *     summary: Get Fitbit health dashboard and health score breakdown
 *     tags: [Users]
 */
router.get("/patient-dashboard", protect, restrictTo("patient"), controller.getPatientDashboard);

/**
 * @openapi
 * /users/admin-dashboard:
 *   get:
 *     summary: Get Admin metrics and system statuses
 *     tags: [Users]
 */
router.get("/admin-dashboard", protect, restrictTo("admin"), controller.getAdminDashboard);

/**
 * @openapi
 * /users/doctors:
 *   get:
 *     summary: Get doctors list (admin/patient filters)
 *     tags: [Users]
 */
router.get("/doctors", protect, controller.getDoctorsList);

/**
 * @openapi
 * /users/patients:
 *   get:
 *     summary: Get patients list (doctor/admin accesses)
 *     tags: [Users]
 */
router.get("/patients", protect, restrictTo("doctor", "admin"), controller.getPatientsList);

/**
 * @openapi
 * /users/approve-doctor:
 *   post:
 *     summary: Admin approvals for doctors
 *     tags: [Users]
 */
router.post("/approve-doctor", protect, restrictTo("admin"), controller.approveDoctor);

export default router;
