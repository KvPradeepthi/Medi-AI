import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /auth/register-patient:
 *   post:
 *     summary: Register a new patient
 *     tags: [Authentication]
 */
router.post("/register-patient", controller.registerPatient);

/**
 * @openapi
 * /auth/register-doctor:
 *   post:
 *     summary: Request doctor account approval
 *     tags: [Authentication]
 */
router.post("/register-doctor", controller.registerDoctor);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 */
router.post("/login", controller.login);

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send 6-digit OTP code to email
 *     tags: [Authentication]
 */
router.post("/send-otp", controller.sendOtp);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify 6-digit OTP code and authenticate
 *     tags: [Authentication]
 */
router.post("/verify-otp", controller.verifyOtp);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request OTP reset email
 *     tags: [Authentication]
 */
router.post("/forgot-password", controller.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Complete password reset
 *     tags: [Authentication]
 */
router.post("/reset-password", controller.resetPassword);

export default router;
