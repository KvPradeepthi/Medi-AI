import { Response, NextFunction } from "express";
import { AppointmentService } from "../services/AppointmentService";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../config/logger";

export class AppointmentController {
  private appointmentService = new AppointmentService();

  book = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const patientId = req.user?._id.toString();
      if (!patientId) {
        return res.status(401).json({ message: "Unauthorized patient context" });
      }

      const appointment = await this.appointmentService.bookAppointment(patientId, req.body);
      return res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  getAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized context" });
      }

      let appointments: any[] = [];
      if (req.user?.role === "patient") {
        appointments = await this.appointmentService.getPatientAppointments(userId);
      } else if (req.user?.role === "doctor") {
        appointments = await this.appointmentService.getDoctorAppointments(userId);
      } else {
        appointments = [];
      }

      return res.status(200).json(appointments);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  cancel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      const userRole = req.user?.role;
      const updated = await this.appointmentService.cancelAppointment(req.params.id, userId, userRole);
      return res.status(200).json(updated);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  complete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.user?._id.toString();
      const userRole = req.user?.role;
      const updated = await this.appointmentService.completeAppointment(req.params.id, doctorId, userRole);
      return res.status(200).json(updated);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };

  prescribe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.user?._id.toString();
      const userRole = req.user?.role;
      logger.info(`Prescribing medicines for appointment: ${req.params.id}`);
      const updated = await this.appointmentService.prescribeMedicines(
        req.params.id,
        req.body,
        doctorId,
        userRole
      );
      return res.status(200).json(updated);
    } catch (error: any) {
      res.status(400);
      next(error);
    }
  };
}
