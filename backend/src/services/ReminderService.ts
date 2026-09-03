import { ReminderRepository } from "../repositories/ReminderRepository";
import { IMedicineReminder } from "../models/MedicineReminder";
import { CreateReminderDto, UpdateReminderLogDto } from "../dto/MedicineDto";
import { logger } from "../config/logger";

export class ReminderService {
  private reminderRepository = new ReminderRepository();

  async addReminder(patientId: string, dto: CreateReminderDto): Promise<IMedicineReminder> {
    const reminder = await this.reminderRepository.create({
      patientId: patientId as any,
      medicineName: dto.medicineName,
      dosage: dto.dosage,
      frequency: dto.frequency,
      timing: dto.timing,
      startDate: dto.startDate,
      endDate: dto.endDate,
      logs: [],
    });
    logger.info(`Added medicine reminder: ${dto.medicineName} for patient ${patientId}`);
    return reminder;
  }

  async getPatientReminders(patientId: string): Promise<IMedicineReminder[]> {
    return this.reminderRepository.findByPatientId(patientId);
  }

  async updateReminderLog(
    reminderId: string,
    dto: UpdateReminderLogDto
  ): Promise<IMedicineReminder | null> {
    const reminder = await this.reminderRepository.findById(reminderId);
    if (!reminder) {
      throw new Error("Medicine reminder not found");
    }

    // Check if log entry for this date and slot already exists
    const existingIndex = reminder.logs.findIndex(
      (log) => log.date === dto.date && log.slot === dto.slot
    );

    if (existingIndex > -1) {
      // Update existing
      reminder.logs[existingIndex].status = dto.status;
    } else {
      // Add new
      reminder.logs.push({
        date: dto.date,
        slot: dto.slot,
        status: dto.status,
      });
    }

    const updated = await reminder.save();
    logger.info(
      `Updated compliance log for reminder ${reminderId} on ${dto.date} (${dto.slot}): ${dto.status}`
    );
    return updated;
  }

  async deleteReminder(id: string): Promise<IMedicineReminder | null> {
    logger.info(`Deleting medicine reminder: ${id}`);
    return this.reminderRepository.delete(id);
  }

  // Calculate compliance rate (Taken / Total Logs)
  async getComplianceRate(patientId: string): Promise<number> {
    const reminders = await this.reminderRepository.findByPatientId(patientId);
    if (reminders.length === 0) return 100; // default 100% compliance if no meds

    let totalSlots = 0;
    let takenSlots = 0;

    reminders.forEach((rem) => {
      rem.logs.forEach((log) => {
        totalSlots++;
        if (log.status === "taken") {
          takenSlots++;
        }
      });
    });

    if (totalSlots === 0) return 100; // No log records yet
    const rate = Math.round((takenSlots / totalSlots) * 100);
    logger.debug(`Compliance rate calculation for Patient ${patientId}: ${rate}% (${takenSlots}/${totalSlots})`);
    return rate;
  }
}
