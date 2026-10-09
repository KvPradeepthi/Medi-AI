import { Response, NextFunction } from "express";
import { ReportService } from "../services/ReportService";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../config/logger";

export class ReportController {
  private reportService = new ReportService();

  uploadReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No report file uploaded" });
      }

      const patientId = req.user?._id.toString();
      if (!patientId) {
        return res.status(401).json({ message: "Unauthorized patient context" });
      }

      const reportType = req.body.reportType || "Other";
      logger.info(`Processing report upload: ${req.file.originalname} for Patient ${patientId}`);

      const report = await this.reportService.uploadAndAnalyze(
        patientId,
        req.file,
        reportType
      );

      return res.status(201).json({
        message: "Medical report processed and indexed successfully",
        report,
      });
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Patients view their own, Doctors and Admins can query specific patientId via query parameter
      let patientId = req.user?._id.toString();
      if ((req.user?.role === "doctor" || req.user?.role === "admin") && req.query.patientId) {
        patientId = req.query.patientId as string;
      }

      if (!patientId) {
        return res.status(400).json({ message: "Missing patient target context" });
      }

      const reports = await this.reportService.getPatientHistory(patientId);
      return res.status(200).json(reports);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  getReportDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const report = await this.reportService.getReportDetails(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report details not found" });
      }

      // Check IDOR authorization: patients may only view their own reports
      const userId = req.user?._id.toString();
      const userRole = req.user?.role;
      if (userRole === "patient" && report.patientId.toString() !== userId) {
        logger.warn(`IDOR blocked: Patient ${userId} attempted to view report ${report._id} belonging to ${report.patientId}`);
        return res.status(403).json({ message: "Forbidden: You do not have permission to view this report" });
      }

      return res.status(200).json(report);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };
}
