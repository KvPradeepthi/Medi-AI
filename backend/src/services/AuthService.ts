import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { UserRepository } from "../repositories/UserRepository";
import User, { IUser } from "../models/User";
import { RegisterPatientDto, RegisterDoctorDto, LoginDto } from "../dto/AuthDto";

export class AuthService {
  private userRepository = new UserRepository();

  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  async registerPatient(dto: RegisterPatientDto): Promise<{ user: IUser; token: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    let hashedPassword = "";
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(dto.password, salt);
    }

    const patient = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: "patient",
      age: dto.age,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      phone: dto.phone,
      emergencyContact: dto.emergencyContact,
      medicalHistory: [],
      allergies: [],
    });

    logger.info(`Patient registered: ${patient.email}`);
    const token = this.generateToken(patient._id.toString());
    return { user: patient, token };
  }

  async registerDoctor(dto: RegisterDoctorDto): Promise<{ user: IUser; token: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("Doctor with this email already exists");
    }

    let hashedPassword = "";
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(dto.password, salt);
    }

    const doctor = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: "doctor",
      specialization: dto.specialization,
      hospital: dto.hospital,
      availability: dto.availability || [],
      status: "pending", // Doctors must be approved by admin
      rating: 5.0,
    });

    logger.info(`Doctor onboarding: ${doctor.email} (Pending Admin Approval)`);
    const token = this.generateToken(doctor._id.toString());
    return { user: doctor, token };
  }

  async login(dto: LoginDto): Promise<{ user: IUser; token: string }> {
    // Check if it's Google Auth
    if (dto.googleToken) {
      return this.googleLogin(dto.googleToken);
    }

    if (!dto.password) {
      throw new Error("Password is required for standard login");
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Google-only users who try logging in standardly
    if (!user.password) {
      throw new Error("Account registered via Google. Please sign in with Google.");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    if (user.role === "doctor" && user.status !== "approved") {
      throw new Error("Your doctor account has not been approved by an administrator yet.");
    }

    logger.info(`User logged in: ${user.email} (Role: ${user.role})`);
    const token = this.generateToken(user._id.toString());
    return { user, token };
  }

  private async googleLogin(googleToken: string): Promise<{ user: IUser; token: string }> {
    if (!googleToken) {
      throw new Error("Google token is required for Google authentication");
    }

    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error(
        "Google Sign-In is not configured on the server. Please contact administrator or sign in with email and password."
      );
    }

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
    } catch (err: any) {
      logger.warn(`Google token verification failed: ${err.message}`);
      throw new Error("Invalid or expired Google authentication token");
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    // Verify token claims per OpenID Connect specifications
    const issuer = payload.iss;
    if (issuer !== "accounts.google.com" && issuer !== "https://accounts.google.com") {
      throw new Error("Invalid token issuer");
    }

    if (!payload.email) {
      throw new Error("Google account does not have an associated email address");
    }

    if (!payload.email_verified) {
      throw new Error("Google email address is not verified");
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split("@")[0];
    const googleId = payload.sub;

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Auto-register new Google user ONLY as a patient. Never admin, never doctor.
      user = await this.userRepository.create({
        name,
        email,
        googleId,
        role: "patient",
        medicalHistory: [],
        allergies: [],
      });
      logger.info(`Auto-registered patient via verified Google sign-in: ${email}`);
    } else {
      // Existing user: check if user already has a different googleId
      if (user.googleId && user.googleId !== googleId) {
        throw new Error("Google account identity mismatch for this email address");
      }
      if (!user.googleId) {
        // Link Google ID
        user.googleId = googleId;
        await this.userRepository.update(user._id.toString(), { googleId });
        logger.info(`Linked verified Google account to user: ${email}`);
      }

      // Check doctor approval
      if (user.role === "doctor" && user.status !== "approved") {
        throw new Error("Your doctor account has not been approved by an administrator yet.");
      }
    }

    const token = this.generateToken(user._id.toString());
    return { user, token };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new Error("Email address is required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (user) {
      // Cryptographically secure token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      });

      logger.info(`Password reset token generated for user: ${normalizedEmail}`);
      // In production with an email provider (SES, SendGrid, SMTP), send email with rawToken here.
      // Do NOT log the token or return it in the HTTP response.
    }

    return {
      message: "If an account with that email exists, password reset instructions have been sent.",
    };
  }

  async resetPassword(dto: {
    email?: string;
    token?: string;
    otp?: string;
    newPassword?: string;
    password?: string;
  }): Promise<{ message: string }> {
    const rawToken = dto.token || dto.otp;
    const newPassword = dto.newPassword || dto.password;

    if (!rawToken) {
      throw new Error("Password reset token is required");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const query: any = {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    };

    if (dto.email) {
      query.email = dto.email.toLowerCase().trim();
    }

    const user = await User.findOne(query);

    if (!user) {
      throw new Error("Invalid or expired password reset token");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset successfully completed for user: ${user.email}`);
    return {
      message: "Your password has been successfully reset. You may now log in.",
    };
  }
}
