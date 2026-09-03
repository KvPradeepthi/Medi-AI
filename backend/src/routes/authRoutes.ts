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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post("/register-patient", controller.registerPatient);

/**
 * @openapi
 * /auth/register-doctor:
 *   post:
 *     summary: Request doctor account approval
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, specialization, hospital]
 *     responses:
 *       201:
 *         description: Registered doctor pending verification
 */
router.post("/register-doctor", controller.registerDoctor);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *     responses:
 *       200:
 *         description: Authenticated successfully
 */
router.post("/login", controller.login);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request OTP reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
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
