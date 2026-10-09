import { UserService } from "../services/UserService";
import { ReportController } from "../controllers/ReportController";
import { AppointmentService } from "../services/AppointmentService";
import { ReminderService } from "../services/ReminderService";
import { restrictTo } from "../middleware/auth";
import { Request, Response, NextFunction } from "express";

jest.mock("../repositories/UserRepository");
jest.mock("../repositories/ReportRepository");
jest.mock("../repositories/AppointmentRepository");
jest.mock("../repositories/ReminderRepository");
jest.mock("../repositories/DietRepository");

describe("Security & Access Control (RBAC & IDOR) Tests", () => {
  describe("A. Privilege Escalation Prevention (User Profile Updates)", () => {
    let userService: UserService;
    let mockUserRepo: any;

    beforeEach(() => {
      jest.clearAllMocks();
      userService = new UserService();
      mockUserRepo = (userService as any).userRepository;
    });

    it("should reject non-admin users attempting to escalate role to admin", async () => {
      const maliciousPayload = {
        name: "Patient Jane",
        role: "admin", // Malicious escalation attempt
      };

      await expect(
        userService.updateProfile("user123", maliciousPayload, false)
      ).rejects.toThrow("Modifying role or account status is not permitted.");

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should reject non-admin users attempting to change approval status", async () => {
      const maliciousPayload = {
        status: "approved", // Malicious escalation attempt
      };

      await expect(
        userService.updateProfile("doc123", maliciousPayload, false)
      ).rejects.toThrow("Modifying role or account status is not permitted.");

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should strip unauthorized fields and whitelist only allowed profile fields", async () => {
      mockUserRepo.update.mockResolvedValue({ _id: "user123", phone: "+123456789" });

      const payload = {
        phone: "+123456789",
        allergies: ["Penicillin"],
        emergencyContact: { name: "Bob", phone: "123", relationship: "Brother" },
        _id: "fake-id",
        password: "new-password",
        googleId: "fake-google-id",
      };

      await userService.updateProfile("user123", payload, false);

      const updateCallArgs = mockUserRepo.update.mock.calls[0][1];
      expect(updateCallArgs.phone).toBe("+123456789");
      expect(updateCallArgs.allergies).toEqual(["Penicillin"]);
      expect(updateCallArgs._id).toBeUndefined();
      expect(updateCallArgs.password).toBeUndefined();
      expect(updateCallArgs.googleId).toBeUndefined();
    });

    it("should allow admin users to update role and status", async () => {
      mockUserRepo.update.mockResolvedValue({ _id: "doc123", status: "approved" });

      await userService.updateProfile("doc123", { status: "approved" }, true);

      expect(mockUserRepo.update).toHaveBeenCalledWith("doc123", { status: "approved" });
    });
  });

  describe("B. IDOR Prevention (Medical Reports Access)", () => {
    let reportController: ReportController;
    let mockReportService: any;
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      reportController = new ReportController();
      mockReportService = (reportController as any).reportService;

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    it("should return 403 Forbidden when Patient A tries to access Patient B's report", async () => {
      // Mock report belonging to patient-B
      mockReportService.getReportDetails = jest.fn().mockResolvedValue({
        _id: "report-999",
        patientId: "patient-B-id",
        fileName: "confidential_biopsy.pdf",
      });

      // Request coming from patient-A
      mockReq = {
        params: { id: "report-999" },
        user: {
          _id: "patient-A-id",
          role: "patient",
        },
      };

      await reportController.getReportDetails(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Forbidden"),
        })
      );
    });

    it("should allow Patient A to view their own report", async () => {
      const ownReport = {
        _id: "report-123",
        patientId: "patient-A-id",
        fileName: "routine_blood_test.pdf",
      };
      mockReportService.getReportDetails = jest.fn().mockResolvedValue(ownReport);

      mockReq = {
        params: { id: "report-123" },
        user: {
          _id: "patient-A-id",
          role: "patient",
        },
      };

      await reportController.getReportDetails(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(ownReport);
    });

    it("should allow Doctors and Admins to view patient reports", async () => {
      const patientReport = {
        _id: "report-123",
        patientId: "patient-A-id",
        fileName: "routine_blood_test.pdf",
      };
      mockReportService.getReportDetails = jest.fn().mockResolvedValue(patientReport);

      // Doctor request
      mockReq = {
        params: { id: "report-123" },
        user: {
          _id: "doctor-1-id",
          role: "doctor",
        },
      };

      await reportController.getReportDetails(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(patientReport);
    });
  });

  describe("C. Appointment Ownership & Access Control", () => {
    let appointmentService: AppointmentService;
    let mockAppRepo: any;

    beforeEach(() => {
      appointmentService = new AppointmentService();
      mockAppRepo = (appointmentService as any).appointmentRepository;
    });

    it("should reject Patient A canceling Patient B's appointment", async () => {
      mockAppRepo.findById.mockResolvedValue({
        _id: "app-100",
        patientId: "patient-B-id",
        doctorId: "doc-1-id",
      });

      await expect(
        appointmentService.cancelAppointment("app-100", "patient-A-id", "patient")
      ).rejects.toThrow("Forbidden: You do not have permission to cancel this appointment");
    });

    it("should reject Doctor X completing Doctor Y's appointment", async () => {
      mockAppRepo.findById.mockResolvedValue({
        _id: "app-100",
        patientId: "patient-B-id",
        doctorId: "doc-Y-id",
      });

      await expect(
        appointmentService.completeAppointment("app-100", "doc-X-id", "doctor")
      ).rejects.toThrow("Forbidden: You are not the assigned doctor for this appointment");
    });
  });

  describe("D. Medicine Reminder Access Control", () => {
    let reminderService: ReminderService;
    let mockRemRepo: any;

    beforeEach(() => {
      reminderService = new ReminderService();
      mockRemRepo = (reminderService as any).reminderRepository;
    });

    it("should reject Patient A modifying Patient B's medication logs", async () => {
      mockRemRepo.findById.mockResolvedValue({
        _id: "rem-100",
        patientId: "patient-B-id",
        logs: [],
        save: jest.fn(),
      });

      await expect(
        reminderService.updateReminderLog(
          "rem-100",
          { date: "2026-10-09", slot: "morning", status: "taken" },
          "patient-A-id",
          "patient"
        )
      ).rejects.toThrow("Forbidden: You do not have permission to modify this reminder");
    });

    it("should reject Patient A deleting Patient B's medication reminder", async () => {
      mockRemRepo.findById.mockResolvedValue({
        _id: "rem-100",
        patientId: "patient-B-id",
      });

      await expect(
        reminderService.deleteReminder("rem-100", "patient-A-id", "patient")
      ).rejects.toThrow("Forbidden: You do not have permission to delete this reminder");
    });
  });

  describe("E. RBAC Middleware (restrictTo)", () => {
    it("should block a patient from accessing an admin-only route", () => {
      const middleware = restrictTo("admin");
      const req: any = { user: { role: "patient", email: "patient@example.com" } };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next: any = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining("permission") })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow an admin to access an admin-only route", () => {
      const middleware = restrictTo("admin");
      const req: any = { user: { role: "admin", email: "admin@example.com" } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      const next: any = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
