import MedicineReminder, { IMedicineReminder } from "../models/MedicineReminder";

export class ReminderRepository {
  async findById(id: string): Promise<IMedicineReminder | null> {
    return MedicineReminder.findById(id);
  }

  async findByPatientId(patientId: string): Promise<IMedicineReminder[]> {
    return MedicineReminder.find({ patientId }).sort({ startDate: 1 });
  }

  async create(reminderData: Partial<IMedicineReminder>): Promise<IMedicineReminder> {
    const reminder = new MedicineReminder(reminderData);
    return reminder.save();
  }

  async update(id: string, updateData: Partial<IMedicineReminder>): Promise<IMedicineReminder | null> {
    return MedicineReminder.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async delete(id: string): Promise<IMedicineReminder | null> {
    return MedicineReminder.findByIdAndDelete(id);
  }
}
