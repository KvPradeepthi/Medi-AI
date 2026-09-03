import Appointment, { IAppointment } from "../models/Appointment";

export class AppointmentRepository {
  async findById(id: string): Promise<IAppointment | null> {
    return Appointment.findById(id)
      .populate("patientId", "name email age gender phone bloodGroup medicalHistory allergies emergencyContact")
      .populate("doctorId", "name email specialization hospital availability");
  }

  async findByPatientId(patientId: string): Promise<IAppointment[]> {
    return Appointment.find({ patientId })
      .populate("doctorId", "name email specialization hospital")
      .sort({ date: 1, timeSlot: 1 });
  }

  async findByDoctorId(doctorId: string): Promise<IAppointment[]> {
    return Appointment.find({ doctorId })
      .populate("patientId", "name email age gender phone bloodGroup")
      .sort({ date: 1, timeSlot: 1 });
  }

  async create(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    const appointment = new Appointment(appointmentData);
    return appointment.save();
  }

  async update(id: string, updateData: Partial<IAppointment>): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async countAppointments(query: any = {}): Promise<number> {
    return Appointment.countDocuments(query);
  }

  async findConflicting(doctorId: string, date: string, timeSlot: string): Promise<IAppointment | null> {
    return Appointment.findOne({ doctorId, date, timeSlot, status: "upcoming" });
  }
}
