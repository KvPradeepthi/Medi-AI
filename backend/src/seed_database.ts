import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./config/env";
import User from "./models/User";
import Report from "./models/Report";
import Appointment from "./models/Appointment";
import MedicineReminder from "./models/MedicineReminder";
import DietPlan from "./models/DietPlan";
import Chat from "./models/Chat";

const seed = async () => {
  console.log("Connecting to database for seeding...");
  if (!env.MONGO_URI) {
    console.error("MONGO_URI environment variable is missing.");
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB cluster.");

  try {
    // 1. Clear database
    console.log("Cleaning database collections...");
    await User.deleteMany({});
    await Report.deleteMany({});
    await Appointment.deleteMany({});
    await MedicineReminder.deleteMany({});
    await DietPlan.deleteMany({});
    await Chat.deleteMany({});

    // 2. Create Users
    console.log("Creating seed users...");
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("password123", salt);

    // Patient
    const patient = await User.create({
      name: "Likhitha Patel",
      email: "likhitha.patient@gmail.com",
      password: defaultPassword,
      role: "patient",
      age: 26,
      gender: "Female",
      bloodGroup: "O+",
      phone: "+1 (555) 019-2834",
      medicalHistory: ["Mild Asthma", "Iron Deficiency"],
      allergies: ["Peanuts", "Dust"],
      emergencyContact: {
        name: "Vikram Patel",
        phone: "+1 (555) 019-9999",
        relationship: "Brother",
      },
    });

    // Doctor
    const doctor = await User.create({
      name: "Dr. Ajay Sharma",
      email: "dr.sharma@hospital.com",
      password: defaultPassword,
      role: "doctor",
      specialization: "Cardiologist",
      hospital: "City Trauma Center",
      status: "approved",
      rating: 4.8,
      availability: [
        { day: "Monday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
        { day: "Wednesday", slots: ["09:00", "10:00", "11:00", "16:00"] },
      ],
    });

    // Admin
    const admin = await User.create({
      name: "Admin Portal Owner",
      email: "admin.mediai@gmail.com",
      password: defaultPassword,
      role: "admin",
    });

    console.log(`Created seed users: Patient (${patient.email}), Doctor (${doctor.email}), Admin (${admin.email})`);

    // 3. Create Reports
    console.log("Creating seed report logs...");
    const report1 = await Report.create({
      patientId: patient._id,
      fileName: "cbc_jan_2026.pdf",
      fileUrl: "/uploads/mock_cbc_report.pdf",
      reportType: "CBC",
      extractedText: "Patient Likhitha Patel. Hemoglobin level checked: 10.5 g/dL (normal range: 12.0 - 16.0). Red blood cell count: 3.8. Platelets: 250k. Findings: Mild Microcytic Anemia.",
      aiAnalysis: {
        summary: "CBC analysis indicates mild microcytic anemia due to lower hemoglobin levels.",
        severity: "YELLOW",
        abnormalValues: [
          {
            marker: "Hemoglobin",
            value: "10.5 g/dL (Normal: 12.0 - 16.0)",
            explanation: "Low hemoglobin indicates mild iron-deficiency anemia, which can cause fatigue.",
            severity: "YELLOW",
          },
        ],
        recommendations: ["Increase iron-rich dietary intake.", "Schedule a ferritin checkup."],
        foods: ["Spinach", "Lentils", "Pomegranates"],
        nextSteps: "Review values with your general physician.",
      },
    });

    const report2 = await Report.create({
      patientId: patient._id,
      fileName: "sugar_log_march.pdf",
      fileUrl: "/uploads/mock_sugar_report.pdf",
      reportType: "Blood Test",
      extractedText: "Fasting Blood Glucose: 95 mg/dL. HbA1c: 5.4%. Cholesterol Total: 180 mg/dL.",
      aiAnalysis: {
        summary: "Blood glucose and cholesterol levels are within ideal normal parameters.",
        severity: "GREEN",
        abnormalValues: [],
        recommendations: ["Maintain current balanced meal plans.", "Perform 150 minutes of physical activity weekly."],
        foods: ["Oats", "Avocado", "Almonds"],
        nextSteps: "No immediate clinical actions needed.",
      },
    });

    // 4. Create Appointments
    console.log("Creating seed appointment logs...");
    const app1 = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      hospital: "City Trauma Center",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "10:00",
      status: "upcoming",
      notes: "Routine check-up for iron deficiency monitoring.",
    });

    const app2 = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      hospital: "City Trauma Center",
      date: "2026-06-10",
      timeSlot: "14:00",
      status: "completed",
      notes: "Follow up consult for microcytic anemia status.",
      prescription: {
        medicines: [
          { name: "Ferrous Ascorbate", dosage: "1 tab", duration: "30 days", timing: ["morning", "night"] },
          { name: "Vitamin C", dosage: "1 tab", duration: "30 days", timing: ["morning"] },
        ],
        advice: "Avoid calcium supplements or milk within 2 hours of taking iron pills to maximize absorption.",
        updatedAt: new Date("2026-06-10T14:30:00Z"),
      },
    });

    // 5. Create Medicine Reminders and logs history
    console.log("Creating seed medicine logs compliance records...");
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const beforeYesterdayStr = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split("T")[0];

    await MedicineReminder.create({
      patientId: patient._id,
      medicineName: "Ferrous Ascorbate",
      dosage: "1 tab",
      frequency: "Daily",
      timing: ["morning", "night"],
      startDate: beforeYesterdayStr,
      endDate: todayStr,
      logs: [
        { date: beforeYesterdayStr, slot: "morning", status: "taken" },
        { date: beforeYesterdayStr, slot: "night", status: "taken" },
        { date: yesterdayStr, slot: "morning", status: "taken" },
        { date: yesterdayStr, slot: "night", status: "skipped" }, // skipped logs
        { date: todayStr, slot: "morning", status: "taken" },
      ],
    });

    await MedicineReminder.create({
      patientId: patient._id,
      medicineName: "Vitamin C",
      dosage: "1 tab",
      frequency: "Daily",
      timing: ["morning"],
      startDate: beforeYesterdayStr,
      endDate: todayStr,
      logs: [
        { date: beforeYesterdayStr, slot: "morning", status: "taken" },
        { date: yesterdayStr, slot: "morning", status: "taken" },
        { date: todayStr, slot: "morning", status: "taken" },
      ],
    });

    // 6. Create Diet plan
    console.log("Creating seed BMI diet plan...");
    await DietPlan.create({
      patientId: patient._id,
      bmi: 22.5,
      targetCalories: 1950,
      targetProtein: 65,
      meals: {
        breakfast: "Iron-fortified oatmeal with slices of strawberries and almonds.",
        lunch: "Steamed quinoa bowl with spinach, lentils, and grilled paneer/chicken.",
        dinner: "Sautéed green beans, broccoli soup, and baked salmon or tofu.",
        snacks: "Roasted pumpkin seeds and pomegranates.",
      },
      waterIntake: 2.5,
    });

    // 7. Chat messages
    console.log("Creating seed chat history...");
    await Chat.create({
      senderId: patient._id,
      receiverId: doctor._id,
      messageType: "text",
      content: "Hello Dr. Sharma, I uploaded my CBC report. Hemoglobin seems low.",
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    });

    await Chat.create({
      senderId: doctor._id,
      receiverId: patient._id,
      messageType: "text",
      content: "Hi Likhitha, yes. Your hemoglobin is 10.5. It indicates mild iron-deficiency anemia. I have written a prescription for Ferrous Ascorbate and Vitamin C to help raise your hemoglobin levels.",
      createdAt: new Date(Date.now() - 1800000), // 30 mins ago
    });

    console.log("Database seeded successfully with premium healthcare dataset! ✅");
    process.exit(0);
  } catch (error) {
    console.error("Database seed failed:", error);
    process.exit(1);
  }
};

seed();
