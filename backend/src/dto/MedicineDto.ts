export interface CreateReminderDto {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: ("morning" | "afternoon" | "night")[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface UpdateReminderLogDto {
  date: string; // YYYY-MM-DD
  slot: "morning" | "afternoon" | "night";
  status: "taken" | "skipped" | "missed";
}
