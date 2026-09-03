import mongoose, { Schema, Document } from "mongoose";

export interface IPrescribedMedicine {
  name: string;
  dosage: string;
  duration: string; // e.g., "7 days"
  timing: string[]; // e.g., ["morning", "night"]
}

export interface IPrescription {
  medicines: IPrescribedMedicine[];
  advice: string;
  updatedAt: Date;
}

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospital: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
  prescription?: IPrescription;
  createdAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hospital: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    notes: { type: String },
    prescription: {
      medicines: [
        {
          name: { type: String },
          dosage: { type: String },
          duration: { type: String },
          timing: { type: [String] },
        },
      ],
      advice: { type: String },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
