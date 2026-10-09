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
      const result = await this.authService.forgotPassword(req.body.email);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Reset password request for: ${req.body.email || "user"}`);
      const result = await this.authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };
}
