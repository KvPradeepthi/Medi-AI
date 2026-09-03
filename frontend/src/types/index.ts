export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  googleId?: string;
  createdAt: string;
  
  // Patient details
  age?: number;
  gender?: "Male" | "Female" | "Other";
  bloodGroup?: string;
  phone?: string;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Doctor details
  specialization?: string;
  hospital?: string;
  availability?: {
    day: string;
    slots: string[];
  }[];
  status?: "pending" | "approved" | "rejected";
  rating?: number;
}

export interface IAbnormalValue {
  marker: string;
  value: string;
  explanation: string;
  severity: "GREEN" | "YELLOW" | "RED";
}

export interface IReport {
  _id: string;
  patientId: string | IUser;
  fileName: string;
  fileUrl: string;
  reportType: "Blood Test" | "CBC" | "MRI" | "CT" | "ECG" | "X-Ray" | "Other";
  extractedText: string;
  aiAnalysis: {
    summary: string;
    severity: "GREEN" | "YELLOW" | "RED";
    abnormalValues: IAbnormalValue[];
    recommendations: string[];
    foods: string[];
    nextSteps: string;
  };
  createdAt: string;
}

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string[];
}

export interface IPrescription {
  medicines: IMedicine[];
  advice: string;
  updatedAt: string;
}

export interface IAppointment {
  _id: string;
  patientId: IUser;
  doctorId: IUser;
  hospital: string;
  date: string;
  timeSlot: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  prescription?: IPrescription;
  createdAt: string;
}

export interface IReminderLog {
  date: string;
  slot: "morning" | "afternoon" | "night";
  status: "taken" | "skipped" | "missed";
}

export interface IMedicineReminder {
  _id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: ("morning" | "afternoon" | "night")[];
  logs: IReminderLog[];
  startDate: string;
  endDate: string;
}

export interface IDietPlan {
  _id: string;
  patientId: string;
  bmi: number;
  targetCalories: number;
  targetProtein: number;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  waterIntake: number;
  createdAt: string;
}

export interface IChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  messageType: "text" | "image" | "report" | "voice";
  content: string;
  createdAt: string;
}
