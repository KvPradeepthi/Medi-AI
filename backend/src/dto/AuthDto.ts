export interface RegisterPatientDto {
  name: string;
  email: string;
  password?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  bloodGroup?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface RegisterDoctorDto {
  name: string;
  email: string;
  password?: string;
  specialization: string;
  hospital: string;
  availability?: {
    day: string;
    slots: string[];
  }[];
}

export interface LoginDto {
  email: string;
  password?: string;
  googleToken?: string; // If logging in via Google OAuth
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword?: string;
}
