import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface SendOtpResult {
  sent: boolean;
  message: string;
  previewOtp?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
        logger.info(`Email service initialized with SMTP host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
      } catch (err: any) {
        logger.warn(`Failed to initialize SMTP transporter: ${err.message}`);
        this.transporter = null;
      }
    } else {
      logger.info(
        "SMTP credentials not configured. OTP verification codes will be logged and available via screen prompt."
      );
    }
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    purpose: "login" | "register" | "reset-password"
  ): Promise<SendOtpResult> {
    const titles: Record<string, { subject: string; heading: string; detail: string }> = {
      login: {
        subject: "MediAI - Your Sign-In Verification Code",
        heading: "Sign In to MediAI",
        detail: "Use the 6-digit code below to securely sign in to your MediAI health portal.",
      },
      register: {
        subject: "MediAI - Verify Your Account Registration",
        heading: "Verify Your Email",
        detail: "Welcome to MediAI! Use the 6-digit code below to complete your registration.",
      },
      "reset-password": {
        subject: "MediAI - Password Reset Verification Code",
        heading: "Reset Your Password",
        detail: "Use the 6-digit code below to verify your identity and reset your MediAI password.",
      },
    };

    const config = titles[purpose] || titles.login;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0b1120; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">MediAI</h1>
          <p style="margin: 4px 0 0 0; color: #ecfdf5; font-size: 13px; font-weight: 500;">Intelligent Clinical Health Platform</p>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 20px; font-weight: 700;">${config.heading}</h2>
          <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">${config.detail}</p>
          
          <div style="background-color: #0f172a; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 600; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Code</div>
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 10px;">${otp}</div>
          </div>
          
          <p style="margin: 0 0 8px 0; color: #cbd5e1; font-size: 13px;">
            ⏱️ This verification code is valid for <strong>10 minutes</strong>.
          </p>
          <p style="margin: 0 0 24px 0; color: #64748b; font-size: 12px;">
            If you did not request this verification code, please ignore this email or contact support if you suspect unauthorized activity.
          </p>
          
          <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
            <p style="margin: 0; color: #475569; font-size: 11px;">MediAI Clinical Platform &copy; ${new Date().getFullYear()} &bull; Secure Healthcare Delivery</p>
          </div>
        </div>
      </div>
    `;

    // Direct screen prompt helper: always returned when SHOW_OTP_IN_RESPONSE is enabled
    const previewOtp = env.SHOW_OTP_IN_RESPONSE ? otp : undefined;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: email,
          subject: config.subject,
          html: htmlContent,
          text: `${config.heading}: Your verification code is ${otp}. Valid for 10 minutes.`,
        });
        logger.info(`OTP email successfully dispatched to ${email} (Purpose: ${purpose})`);
        return {
          sent: true,
          message: `Verification code sent to ${email}`,
          previewOtp,
        };
      } catch (err: any) {
        logger.error(`Failed to send email to ${email}: ${err.message}. Providing direct screen prompt.`);
        return {
          sent: false,
          message: `Verification code generated for ${email}`,
          previewOtp: otp,
        };
      }
    }

    // SMTP not configured - simulate delivery and log code
    logger.info(`[DEMO/SCREEN PROMPT] OTP generated for ${email}: ${otp} (Purpose: ${purpose})`);
    return {
      sent: false,
      message: `Verification code generated for ${email} (Direct screen prompt ready)`,
      previewOtp: otp,
    };
  }
}
