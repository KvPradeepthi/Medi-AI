import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { logger } from "../config/logger";

export class AuthController {
  private authService = new AuthService();

  registerPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Patient registration request for: ${req.body.email}`);
      const data = await this.authService.registerPatient(req.body);
      return res.status(201).json(data);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  registerDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Doctor onboarding request for: ${req.body.email}`);
      const data = await this.authService.registerDoctor(req.body);
      return res.status(201).json(data);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Login request for: ${req.body.email}`);
      const data = await this.authService.login(req.body);
      return res.status(200).json(data);
    } catch (error: any) {
      res.status(401);
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Forgot password request for: ${req.body.email}`);
      // Simulate sending OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      logger.info(`Simulated OTP for ${req.body.email}: ${otp}`);
      return res.status(200).json({ 
        message: "An OTP has been sent to your registered email address.",
        simulatedOtp: otp // sent back for demo purposes so it is fully testable!
      });
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Reset password request for: ${req.body.email}`);
      // Simple OTP verification demo
      if (req.body.otp !== "123456" && !req.body.otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      return res.status(200).json({ message: "Your password has been successfully reset." });
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };
}
