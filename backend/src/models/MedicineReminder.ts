import mongoose, { Schema, Document } from "mongoose";

export interface IReminderLog {
  date: string; // YYYY-MM-DD
  slot: "morning" | "afternoon" | "night";
  status: "taken" | "skipped" | "missed";
}

export interface IMedicineReminder extends Document {
  patientId: mongoose.Types.ObjectId;
  medicineName: string;
  dosage: string; // e.g. "1 pill"
  frequency: string; // e.g. "Daily"
  timing: ("morning" | "afternoon" | "night")[];
  logs: IReminderLog[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: Date;
}

const MedicineReminderSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: "Daily" },
    timing: {
      type: [String],
      enum: ["morning", "afternoon", "night"],
      required: true,
    },
    logs: [
      {
        date: { type: String, required: true },
        slot: { type: String, enum: ["morning", "afternoon", "night"], required: true },
        status: { type: String, enum: ["taken", "skipped", "missed"], required: true },
      },
    ],
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicineReminder>("MedicineReminder", MedicineReminderSchema);
