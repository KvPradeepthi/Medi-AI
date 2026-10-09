import { AuthService } from "../services/AuthService";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import User from "../models/User";

// Mock google-auth-library
jest.mock("google-auth-library");
// Mock UserRepository
jest.mock("../repositories/UserRepository");

describe("AuthService Security & Functionality Tests", () => {
  let authService: AuthService;
  let mockUserRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserRepo = (authService as any).userRepository;
    env.GOOGLE_CLIENT_ID = "mock-google-client-id.apps.googleusercontent.com";
  });

  describe("A. Standard Registration & Login", () => {
    it("should hash password using bcrypt when registering a patient", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(async (data: any) => ({
        _id: "user123",
        role: "patient",
        ...data,
      }));

      const res = await authService.registerPatient({
        name: "Test Patient",
        email: "test.patient@example.com",
        password: "securePassword123",
      });

      expect(res.user.email).toBe("test.patient@example.com");
      expect(res.token).toBeDefined();

      const createdArgs = mockUserRepo.create.mock.calls[0][0];
      expect(createdArgs.password).not.toBe("securePassword123");
      const isMatch = await bcrypt.compare("securePassword123", createdArgs.password);
      expect(isMatch).toBe(true);
    });

    it("should reject patient registration if email already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ _id: "existing123", email: "dup@example.com" });

      await expect(
        authService.registerPatient({
          name: "Duplicate",
          email: "dup@example.com",
          password: "password123",
        })
      ).rejects.toThrow("User with this email already exists");
    });

    it("should set doctor status to pending on registration", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(async (data: any) => ({
        _id: "doc123",
        ...data,
      }));

      const res = await authService.registerDoctor({
        name: "Dr. Candidate",
        email: "doc@hospital.com",
        password: "doctorPass123",
        specialization: "Cardiology",
        hospital: "General Hospital",
      });

      const createdArgs = mockUserRepo.create.mock.calls[0][0];
      expect(createdArgs.status).toBe("pending");
      expect(createdArgs.role).toBe("doctor");
    });

    it("should block unapproved doctors from logging in", async () => {
      const hashed = await bcrypt.hash("doctorPass123", 10);
      mockUserRepo.findByEmail.mockResolvedValue({
        _id: "doc123",
        email: "doc@hospital.com",
        password: hashed,
        role: "doctor",
        status: "pending", // Not approved
      });

      await expect(
        authService.login({ email: "doc@hospital.com", password: "doctorPass123" })
      ).rejects.toThrow("Your doctor account has not been approved by an administrator yet.");
    });

    it("should reject login with incorrect password", async () => {
      const hashed = await bcrypt.hash("correctPassword", 10);
      mockUserRepo.findByEmail.mockResolvedValue({
        _id: "user123",
        email: "user@example.com",
        password: hashed,
        role: "patient",
      });

      await expect(
        authService.login({ email: "user@example.com", password: "wrongPassword" })
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("B. Genuine Google Authentication & Prevention of Spoofing", () => {
    it("should reject Google login when GOOGLE_CLIENT_ID is not configured", async () => {
      env.GOOGLE_CLIENT_ID = "";

      await expect(
        authService.login({ email: "", googleToken: "some-raw-token" })
      ).rejects.toThrow("Google Sign-In is not configured on the server");
    });

    it("should reject Google login when Google ID token fails signature/claims verification", async () => {
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error("Invalid token signature"));
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      await expect(
        authService.login({ email: "", googleToken: "forged-or-expired-token" })
      ).rejects.toThrow("Invalid or expired Google authentication token");
    });

    it("should reject Google token if email is not verified by Google", async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          iss: "accounts.google.com",
          email: "unverified@gmail.com",
          email_verified: false, // NOT verified
          sub: "google-sub-123",
        }),
      });
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      await expect(
        authService.login({ email: "", googleToken: "valid-sig-but-unverified-email" })
      ).rejects.toThrow("Google email address is not verified");
    });

    it("should reject Google token if issuer is invalid", async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          iss: "evil-issuer.com", // Bad issuer
          email: "target@gmail.com",
          email_verified: true,
          sub: "google-sub-123",
        }),
      });
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      await expect(
        authService.login({ email: "", googleToken: "fake-issuer-token" })
      ).rejects.toThrow("Invalid token issuer");
    });

    it("should register new Google user strictly as patient (never admin)", async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          iss: "https://accounts.google.com",
          email: "new.google.user@gmail.com",
          email_verified: true,
          name: "Google User",
          sub: "google-sub-9999",
        }),
      });
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(async (data: any) => ({
        _id: "new-user-id",
        ...data,
      }));

      const res = await authService.login({
        email: "",
        googleToken: "valid-genuine-google-token",
      });

      expect(res.user.role).toBe("patient");
      expect(res.user.email).toBe("new.google.user@gmail.com");
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "patient",
          googleId: "google-sub-9999",
        })
      );
    });
  });

  describe("C. Secure Password Reset Flow", () => {
    it("forgotPassword should not leak reset token or OTP in response", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        _id: "user123",
        email: "patient@example.com",
      });
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue({} as any);

      const res = await authService.forgotPassword("patient@example.com");

      // Verify response does NOT contain any OTP or token
      expect(res).not.toHaveProperty("simulatedOtp");
      expect(res).not.toHaveProperty("otp");
      expect(res).not.toHaveProperty("token");
      expect(res.message).toContain("If an account with that email exists");

      // Verify hashed token was stored in DB
      const updateCall = (User.findByIdAndUpdate as jest.Mock).mock.calls[0];
      expect(updateCall[1].resetPasswordToken).toBeDefined();
      expect(typeof updateCall[1].resetPasswordToken).toBe("string");
      expect(updateCall[1].resetPasswordToken.length).toBe(64); // SHA-256 hex length
    });

    it("resetPassword should verify cryptographic hash and update password", async () => {
      const rawToken = "my-test-secret-reset-token";
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockFoundUser: any = {
        _id: "user123",
        email: "patient@example.com",
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 600000),
        save: mockSave,
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockFoundUser);

      const res = await authService.resetPassword({
        token: rawToken,
        newPassword: "brandNewSecurePassword456",
      });

      expect(res.message).toContain("successfully reset");
      expect(mockSave).toHaveBeenCalled();
      expect(mockFoundUser.resetPasswordToken).toBeUndefined();
      expect(mockFoundUser.resetPasswordExpires).toBeUndefined();

      const match = await bcrypt.compare("brandNewSecurePassword456", mockFoundUser.password);
      expect(match).toBe(true);
    });

    it("resetPassword should reject expired or invalid tokens", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await expect(
        authService.resetPassword({
          token: "invalid-or-expired-token",
          newPassword: "newPassword123",
        })
      ).rejects.toThrow("Invalid or expired password reset token");
    });
  });
});
