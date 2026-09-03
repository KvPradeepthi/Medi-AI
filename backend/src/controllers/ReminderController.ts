import { Response, NextFunction } from "express";
import { ReminderService } from "../services/ReminderService";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../config/logger";

export class ReminderController {
  private reminderService = new ReminderService();

  add = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const patientId = req.user?._id.toString();
      if (!patientId) {
        return res.status(401).json({ message: "Unauthorized patient context" });
      }

      const reminder = await this.reminderService.addReminder(patientId, req.body);
      return res.status(201).json(reminder);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let patientId = req.user?._id.toString();
      if (req.user?.role === "doctor" && req.query.patientId) {
        patientId = req.query.patientId as string;
      }

      if (!patientId) {
        return res.status(400).json({ message: "Missing patient context" });
      }

      const reminders = await this.reminderService.getPatientReminders(patientId);
      const complianceRate = await this.reminderService.getComplianceRate(patientId);

      return res.status(200).json({ reminders, complianceRate });
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  updateLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await this.reminderService.updateReminderLog(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.reminderService.deleteReminder(req.params.id);
      return res.status(200).json(deleted);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };
}
