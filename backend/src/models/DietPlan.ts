import mongoose, { Schema, Document } from "mongoose";

export interface IMeals {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface IDietPlan extends Document {
  patientId: mongoose.Types.ObjectId;
  bmi: number;
  targetCalories: number;
  targetProtein: number; // in grams
  meals: IMeals;
  waterIntake: number; // in liters
  createdAt: Date;
}

const DietPlanSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bmi: { type: Number, required: true },
    targetCalories: { type: Number, required: true },
    targetProtein: { type: Number, required: true },
    meals: {
      breakfast: { type: String, required: true },
      lunch: { type: String, required: true },
      dinner: { type: String, required: true },
      snacks: { type: String, required: true },
    },
    waterIntake: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDietPlan>("DietPlan", DietPlanSchema);
