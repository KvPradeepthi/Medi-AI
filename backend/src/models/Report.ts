import mongoose, { Schema, Document } from "mongoose";

export interface IAbnormalValue {
  marker: string;
  value: string;
  explanation: string;
  severity: "GREEN" | "YELLOW" | "RED";
}

export interface IAiAnalysis {
  summary: string;
  severity: "GREEN" | "YELLOW" | "RED";
  abnormalValues: IAbnormalValue[];
  recommendations: string[];
  foods: string[];
  nextSteps: string;
}

export interface IReport extends Document {
  patientId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  reportType: "Blood Test" | "CBC" | "MRI" | "CT" | "ECG" | "X-Ray" | "Other";
  extractedText: string;
  aiAnalysis: IAiAnalysis;
  createdAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    reportType: {
      type: String,
      enum: ["Blood Test", "CBC", "MRI", "CT", "ECG", "X-Ray", "Other"],
      default: "Other",
    },
    extractedText: { type: String, default: "" },
    aiAnalysis: {
      summary: { type: String, default: "" },
      severity: { type: String, enum: ["GREEN", "YELLOW", "RED"], default: "GREEN" },
      abnormalValues: [
        {
          marker: { type: String },
          value: { type: String },
          explanation: { type: String },
          severity: { type: String, enum: ["GREEN", "YELLOW", "RED"] },
        },
      ],
      recommendations: { type: [String], default: [] },
      foods: { type: [String], default: [] },
      nextSteps: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>("Report", ReportSchema);
