import { UserRepository } from "../repositories/UserRepository";
import { ReportRepository } from "../repositories/ReportRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ReminderRepository } from "../repositories/ReminderRepository";
import { DietRepository } from "../repositories/DietRepository";
import { IUser } from "../models/User";
import { logger } from "../config/logger";
import axios from "axios";
import { env } from "../config/env";

export interface IHealthScoreBreakdown {
  overall: number;
  bmi: number;
  sugar: number;
  heart: number;
  bloodPressure: number;
  compliance: number;
  activity: number;
}

export class UserService {
  private userRepository = new UserRepository();
  private reportRepository = new ReportRepository();
  private appointmentRepository = new AppointmentRepository();
  private reminderRepository = new ReminderRepository();
  private dietRepository = new DietRepository();

  async getUserProfile(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async updateProfile(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    logger.info(`Updating profile for user: ${id}`);
    return this.userRepository.update(id, updateData);
  }

  // AI Health Score Generation (Fitbit style)
  async getPatientHealthMetrics(patientId: string): Promise<{
    scoreBreakdown: IHealthScoreBreakdown;
    aiSuggestions: string;
  }> {
    // 1. Fetch compliance rate
    const reminders = await this.reminderRepository.findByPatientId(patientId);
    let totalSlots = 0;
    let takenSlots = 0;
    reminders.forEach((rem) => {
      rem.logs.forEach((log) => {
        totalSlots++;
        if (log.status === "taken") takenSlots++;
      });
    });
    const complianceRate = totalSlots > 0 ? Math.round((takenSlots / totalSlots) * 100) : 100;

    // 2. Fetch latest diet plan to inspect BMI
    const latestDiet = await this.dietRepository.findLatestByPatientId(patientId);
    const bmi = latestDiet ? latestDiet.bmi : 22.5; // default normal if none

    // 3. Fetch patient reports to check severity and values
    const reports = await this.reportRepository.findByPatientId(patientId);
    let redCount = 0;
    let yellowCount = 0;
    let latestSugar = 90; // default normal mg/dL
    let latestSystolic = 120; // default normal mmHg
    let latestHeartRate = 72; // default normal bpm

    reports.forEach((rep) => {
      if (rep.aiAnalysis.severity === "RED") redCount++;
      if (rep.aiAnalysis.severity === "YELLOW") yellowCount++;

      // Inspect report text for markers if present
      const text = rep.extractedText.toLowerCase();
      if (text.includes("glucose") || text.includes("sugar")) {
        latestSugar = 145; // simulate abnormal if report exists
      }
      if (text.includes("systolic") || text.includes("blood pressure")) {
        latestSystolic = 135; // simulate abnormal
      }
      if (text.includes("heart") || text.includes("ecg")) {
        latestHeartRate = 88;
      }
    });

    // 4. Calculate sub-scores (0-100 scale)
    const bmiScore = bmi >= 18.5 && bmi <= 24.9 ? 100 : bmi < 18.5 ? 75 : 65; // underweight vs overweight
    const sugarScore = latestSugar < 100 ? 100 : latestSugar < 126 ? 80 : 50; // normal vs pre-diabetic vs diabetic
    const bpScore = latestSystolic < 120 ? 100 : latestSystolic < 130 ? 85 : latestSystolic < 140 ? 70 : 45;
    const heartScore = latestHeartRate >= 60 && latestHeartRate <= 80 ? 100 : 80;
    const complianceScore = complianceRate;
    const activityScore = complianceRate > 80 ? 95 : 75; // simple log activity correlation

    // 5. Aggregate overall health score
    let overall = Math.round(
      bmiScore * 0.15 +
      sugarScore * 0.20 +
      bpScore * 0.20 +
      heartScore * 0.15 +
      complianceScore * 0.20 +
      activityScore * 0.10
    );

    // Apply penalties for severe clinical indicators
    overall -= redCount * 12;
    overall -= yellowCount * 4;
    overall = Math.max(30, Math.min(100, overall)); // Cap between 30 and 100

    // 6. Request FastAPI AI summary or return structured mock backup
    let aiSuggestions = "Your vitals are looking positive. Keep up your active routine and stay hydrated!";
    try {
      const response = await axios.post(`${env.AI_SERVICE_URL}/api/v1/ai/health-summary`, {
        age: 30, // Fallbacks if not fully populated
        bmi,
        compliance_rate: complianceRate,
        red_count: redCount,
        yellow_count: yellowCount,
        latest_vitals: { sugar: latestSugar, bp: latestSystolic, heart_rate: latestHeartRate },
      });
      if (response.data && response.data.summary) {
        aiSuggestions = response.data.summary;
      }
    } catch (e: any) {
      logger.error(`AI health summary compilation failed: ${e.message}`);
      if (redCount > 0 || yellowCount > 0) {
        aiSuggestions = "Warning: We detected elevated markers in your recent blood reports. We recommend scheduling an appointment with your doctor to review your treatment plan and adjust your medication logs.";
      }
    }

    return {
      scoreBreakdown: {
        overall,
        bmi: bmiScore,
        sugar: sugarScore,
        heart: heartScore,
        bloodPressure: bpScore,
        compliance: complianceScore,
        activity: activityScore,
      },
      aiSuggestions,
    };
  }

  // Admin Module Dashboard details
  async getAdminDashboardMetrics(): Promise<any> {
    const patientsCount = await this.userRepository.countUsersByRole("patient");
    const doctorsCount = await this.userRepository.countUsersByRole("doctor");
    const appointmentsCount = await this.appointmentRepository.countAppointments();
    const reportsCount = await this.reportRepository.countReports();

    const reportTypeDistribution = await this.reportRepository.countByReportType();
    
    // System status mock
    const systemHealth = {
      database: "healthy",
      aiService: "healthy",
      socket: "healthy",
      backend: "healthy",
      pingTime: "24ms",
    };

    return {
      cards: {
        patients: patientsCount,
        doctors: doctorsCount,
        appointments: appointmentsCount,
        reports: reportsCount,
      },
      reportTypeDistribution,
      systemHealth,
    };
  }

  // Doctor approval workflow
  async approveDoctor(doctorId: string, status: "approved" | "rejected"): Promise<IUser | null> {
    logger.info(`Admin action: updating doctor ${doctorId} status to ${status}`);
    return this.userRepository.update(doctorId, { status });
  }
}
