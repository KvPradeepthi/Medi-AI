export interface CreateAppointmentDto {
  doctorId: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  notes?: string;
}

export interface UpdatePrescriptionDto {
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    timing: string[];
  }[];
  advice: string;
}
