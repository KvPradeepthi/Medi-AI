import DietPlan, { IDietPlan } from "../models/DietPlan";

export class DietRepository {
  async findLatestByPatientId(patientId: string): Promise<IDietPlan | null> {
    return DietPlan.findOne({ patientId }).sort({ createdAt: -1 });
  }

  async create(dietData: Partial<IDietPlan>): Promise<IDietPlan> {
    const plan = new DietPlan(dietData);
    return plan.save();
  }
}
