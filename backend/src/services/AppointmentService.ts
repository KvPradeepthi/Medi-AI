import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { IAppointment } from "../models/Appointment";
import { CreateAppointmentDto, UpdatePrescriptionDto } from "../dto/AppointmentDto";
import { logger } from "../config/logger";
import MedicineReminder from "../models/MedicineReminder"; // to auto create reminders on prescription

export class AppointmentService {
  private appointmentRepository = new AppointmentRepository();

  async bookAppointment(patientId: string, dto: CreateAppointmentDto): Promise<IAppointment> {
    const isConflict = await this.appointmentRepository.findConflicting(
      dto.doctorId,
      dto.date,
      dto.timeSlot
    );

    if (isConflict) {
      throw new Error("This doctor is already booked for the selected date and time slot.");
    }

    const appointment = await this.appointmentRepository.create({
      patientId: patientId as any,
      doctorId: dto.doctorId as any,
      hospital: dto.hospital,
      date: dto.date,
      timeSlot: dto.timeSlot,
      notes: dto.notes,
      status: "upcoming",
    });

    logger.info(`Appointment booked successfully: Patient ${patientId} with Doctor ${dto.doctorId}`);
    return appointment;
  }

  async getPatientAppointments(patientId: string): Promise<IAppointment[]> {
    return this.appointmentRepository.findByPatientId(patientId);
  }

  async getDoctorAppointments(doctorId: string): Promise<IAppointment[]> {
    return this.appointmentRepository.findByDoctorId(doctorId);
  }

  async getAppointmentDetails(id: string): Promise<IAppointment | null> {
    return this.appointmentRepository.findById(id);
  }

  async cancelAppointment(
    id: string,
    userId?: string,
    userRole?: string
  ): Promise<IAppointment | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (userId && userRole) {
      const patientId =
        (appointment.patientId as any)?._id?.toString() || appointment.patientId?.toString();
      const doctorId =
        (appointment.doctorId as any)?._id?.toString() || appointment.doctorId?.toString();

      if (userRole === "patient" && patientId !== userId) {
        throw new Error("Forbidden: You do not have permission to cancel this appointment");
      }
      if (userRole === "doctor" && doctorId !== userId) {
        throw new Error("Forbidden: You do not have permission to cancel this appointment");
      }
    }

    logger.info(`Cancelling appointment: ${id}`);
    return this.appointmentRepository.update(id, { status: "cancelled" });
  }

  async completeAppointment(
    id: string,
    doctorId?: string,
    userRole?: string
  ): Promise<IAppointment | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (doctorId && userRole !== "admin") {
      const assignedDoctorId =
        (appointment.doctorId as any)?._id?.toString() || appointment.doctorId?.toString();
      if (assignedDoctorId !== doctorId) {
        throw new Error("Forbidden: You are not the assigned doctor for this appointment");
      }
    }

    logger.info(`Completing appointment: ${id}`);
    return this.appointmentRepository.update(id, { status: "completed" });
  }

  async prescribeMedicines(
    id: string,
    dto: UpdatePrescriptionDto,
    doctorId?: string,
    userRole?: string
  ): Promise<IAppointment | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (doctorId && userRole !== "admin") {
      const assignedDoctorId =
        (appointment.doctorId as any)?._id?.toString() || appointment.doctorId?.toString();
      if (assignedDoctorId !== doctorId) {
        throw new Error("Forbidden: You are not the assigned doctor for this appointment");
      }
    }

    const prescription = {
      medicines: dto.medicines,
      advice: dto.advice,
      updatedAt: new Date(),
    };

    const updated = await this.appointmentRepository.update(id, {
      prescription,
      status: "completed",
    });

    // Auto-create medicine reminders for the patient based on this prescription!
    try {
      logger.info(`Creating automated reminders from prescription for Patient: ${appointment.patientId._id}`);
      
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // default 7 days

      for (const med of dto.medicines) {
        // Parse timings (e.g. Map "morning, night" or use direct matches)
        const timingKeys: ("morning" | "afternoon" | "night")[] = [];
        med.timing.forEach((t) => {
          const clean = t.toLowerCase();
          if (clean === "morning" || clean === "afternoon" || clean === "night") {
            timingKeys.push(clean as any);
          }
        });

        await MedicineReminder.create({
          patientId: appointment.patientId._id,
          medicineName: med.name,
          dosage: med.dosage,
          frequency: "Daily",
          timing: timingKeys.length > 0 ? timingKeys : ["morning"],
          startDate: today,
          endDate: med.duration.includes("day") 
            ? new Date(Date.now() + parseInt(med.duration) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            : endDate,
          logs: [],
        });
      }
    } catch (reminderErr: any) {
      logger.error(`Automated medicine reminders creation from prescription failed: ${reminderErr.message}`);
    }

    return updated;
  }
}
