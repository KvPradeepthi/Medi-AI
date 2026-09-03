import { Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../config/logger";
import User from "../models/User";

export class UserController {
  private userService = new UserService();

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserProfile(req.user?._id.toString() || "");
      return res.status(200).json(user);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await this.userService.updateProfile(req.user?._id.toString() || "", req.body);
      return res.status(200).json(updated);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  getPatientDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const patientId = req.user?._id.toString();
      if (!patientId) {
        return res.status(401).json({ message: "Unauthorized context" });
      }

      logger.info(`Fetching dashboard details and AI Health Score for Patient: ${patientId}`);
      const metrics = await this.userService.getPatientHealthMetrics(patientId);
      return res.status(200).json(metrics);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  getAdminDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info("Admin request: fetching platform statistics and health metrics.");
      const metrics = await this.userService.getAdminDashboardMetrics();
      return res.status(200).json(metrics);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  // Manage Doctors Approvals
  getDoctorsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as "pending" | "approved" | "rejected" | undefined;
      const list = await User.find({ role: "doctor", ...(status ? { status } : {}) }).sort({ name: 1 });
      return res.status(200).json(list);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  approveDoctor = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { doctorId, status } = req.body;
      if (!doctorId || !status) {
        return res.status(400).json({ message: "Missing doctorId or approval status" });
      }

      const updated = await this.userService.approveDoctor(doctorId, status);
      return res.status(200).json({
        message: `Doctor successfully updated to ${status}`,
        doctor: updated,
      });
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  getPatientsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const list = await User.find({ role: "patient" }).sort({ name: 1 });
      return res.status(200).json(list);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };
}
