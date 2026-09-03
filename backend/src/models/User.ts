import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IAvailability {
  day: string; // e.g., "Monday"
  slots: string[]; // e.g., ["09:00", "10:00"]
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "patient" | "doctor" | "admin";
  googleId?: string;
  createdAt: Date;
  
  // Patient Profile Details
  age?: number;
  gender?: "Male" | "Female" | "Other";
  bloodGroup?: string;
  phone?: string;
  medicalHistory: string[];
  allergies: string[];
  emergencyContact?: IEmergencyContact;
  
  // Doctor Profile Details
  specialization?: string;
  hospital?: string;
  availability: IAvailability[];
  status: "pending" | "approved" | "rejected";
  rating: number;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    googleId: { type: String },
    
    // Patient Details
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bloodGroup: { type: String },
    phone: { type: String },
    medicalHistory: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    
    // Doctor Details
    specialization: { type: String },
    hospital: { type: String },
    availability: [
      {
        day: { type: String },
        slots: { type: [String] },
      },
    ],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rating: { type: Number, default: 5.0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
