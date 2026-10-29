import Otp, { IOtp } from "../models/Otp";

export class OtpRepository {
  async createOtp(data: {
    email: string;
    otpHash: string;
    purpose: "login" | "register" | "reset-password";
    expiresAt: Date;
  }): Promise<IOtp> {
    // Delete any active OTP for this email and purpose first
    await Otp.deleteMany({ email: data.email.toLowerCase().trim(), purpose: data.purpose });

    const record = new Otp({
      email: data.email.toLowerCase().trim(),
      otpHash: data.otpHash,
      purpose: data.purpose,
      expiresAt: data.expiresAt,
    });
    return record.save();
  }

  async findLatestValidOtp(
    email: string,
    purpose: "login" | "register" | "reset-password"
  ): Promise<IOtp | null> {
    return Otp.findOne({
      email: email.toLowerCase().trim(),
      purpose,
      expiresAt: { $gt: new Date() },
      verified: false,
    }).sort({ createdAt: -1 });
  }

  async incrementAttempts(id: string): Promise<IOtp | null> {
    return Otp.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true });
  }

  async markVerified(id: string): Promise<IOtp | null> {
    return Otp.findByIdAndUpdate(id, { $set: { verified: true } }, { new: true });
  }

  async deleteByEmailAndPurpose(
    email: string,
    purpose: "login" | "register" | "reset-password"
  ): Promise<void> {
    await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose });
  }
}
