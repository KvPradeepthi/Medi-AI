import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight, Chrome, KeyRound, RotateCcw, CheckCircle2 } from "lucide-react";

const Login: React.FC = () => {
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [authMode, setAuthMode] = useState<"password" | "otp">(
    searchParams.get("tab") === "otp" ? "otp" : "password"
  );

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [screenOtp, setScreenOtp] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const handleGoogleCredentialResponse = async (response: any) => {
      if (!response?.credential) {
        setError("Failed to obtain Google authentication credentials.");
        return;
      }
      setError("");
      setIsLoading(true);
      try {
        await login("", undefined, response.credential);
        setIsLoading(false);
        navigate("/dashboard");
      } catch (err: any) {
        setIsLoading(false);
        setError(err || "Google authentication failed.");
      }
    };

    // Load Google GIS script dynamically if not present
    const existingScript = document.getElementById("google-gis-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gis-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
          });
          const buttonElement = document.getElementById("google-signin-btn-container");
          if (buttonElement) {
            (window as any).google.accounts.id.renderButton(buttonElement, {
              theme: "filled_blue",
              size: "large",
              width: 380,
              text: "continue_with",
              shape: "rectangular",
            });
          }
        }
      };
      document.body.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
      });
      const buttonElement = document.getElementById("google-signin-btn-container");
      if (buttonElement) {
        (window as any).google.accounts.id.renderButton(buttonElement, {
          theme: "filled_blue",
          size: "large",
          width: 380,
          text: "continue_with",
          shape: "rectangular",
        });
      }
    }
  }, [googleClientId]);

  // Standard Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Login failed");
    }
  };

  // OTP Request Code Submit
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await sendOtp(email);
      setIsLoading(false);
      setSuccessMsg(res.message || "6-digit verification code has been dispatched.");
      if (res.otp) {
        setScreenOtp(res.otp);
      }
      setOtpStep("verify");
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Failed to send verification code");
    }
  };

  // OTP Verification Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await verifyOtp(email, otpCode.trim());
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Invalid or expired verification code.");
    }
  };

  const handleManualGoogleClick = () => {
    if (!googleClientId) {
      setError(
        "Google Sign-In is not configured. Please configure VITE_GOOGLE_CLIENT_ID or sign in with email and password."
      );
      return;
    }
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    }
  };

  // Demo credential autofill helper
  const fillDemoCredentials = (role: "patient" | "doctor" | "admin") => {
    const credentials = {
      patient: { email: "likhitha.patient@gmail.com", pass: "password123" },
      doctor: { email: "dr.sharma@hospital.com", pass: "password123" },
      admin: { email: "admin.mediai@gmail.com", pass: "password123" },
    };
    const target = credentials[role];
    setEmail(target.email);
    setPassword(target.pass);
    setOtpCode("");
    setScreenOtp(null);
    setError("");
  };

  return (
    <div className="bg-[#0a0f1d] min-h-screen flex items-center justify-center p-6 select-none relative">
      <div className="absolute w-80 h-80 bg-emerald-500/5 blur-[140px] rounded-full top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-blue-500/5 blur-[140px] rounded-full bottom-10 right-10"></div>

      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full max-w-md relative z-10 border border-slate-800/80">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 rounded-2xl bg-emerald-500 text-slate-900 emerald-glow mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Welcome to MediAI</h2>
          <p className="text-slate-400 text-xs mt-1">Access your secure clinical healthcare portal</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              authMode === "password" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              authMode === "otp" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            6-Digit OTP
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Password Login Flow */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In with Password"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 6-Digit OTP Flow */}
        {authMode === "otp" && (
          <div>
            {otpStep === "request" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address for Verification</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter your email to receive a secure 6-digit code. New users will be automatically registered!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200"
                >
                  {isLoading ? "Generating Code..." : "Get 6-Digit Code"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Direct Screen Prompt Badge */}
                {screenOtp && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-1.5 text-center">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Direct Screen Prompt (Demo & Testing)</span>
                    </div>
                    <div className="text-2xl font-mono font-black text-white tracking-widest my-1 select-all">
                      {screenOtp}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(screenOtp)}
                      className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-semibold"
                    >
                      Click to auto-fill code
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400">Enter 6-Digit Code</label>
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resend
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center font-mono text-lg tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                    <span>Sent to: {email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("request");
                        setOtpCode("");
                        setScreenOtp(null);
                      }}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Change email
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-slate-800/80"></div>
          <span className="relative z-10 px-3 bg-[#0c1223] text-xs font-semibold text-slate-500 uppercase">
            Or Continue With
          </span>
        </div>

        {googleClientId ? (
          <div id="google-signin-btn-container" className="flex justify-center w-full min-h-[44px]"></div>
        ) : (
          <button
            type="button"
            onClick={handleManualGoogleClick}
            className="w-full py-3 px-4 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-3 transition"
          >
            <Chrome className="w-4 h-4 text-emerald-400" />
            Sign in with Google
          </button>
        )}

        {/* Demo Credentials Helper */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-slate-800/80"></div>
          <span className="relative z-10 px-3 bg-[#0c1223] text-[10px] font-semibold text-slate-500 uppercase">
            Autofill Demo Credentials
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              fillDemoCredentials("patient");
            }}
            className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-850 rounded-xl text-[10px] font-bold text-emerald-400 transition"
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              fillDemoCredentials("doctor");
            }}
            className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-850 rounded-xl text-[10px] font-bold text-blue-400 transition"
          >
            Doctor
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              fillDemoCredentials("admin");
            }}
            className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-850 rounded-xl text-[10px] font-bold text-violet-400 transition"
          >
            Admin
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold">
            Create Account
          </Link>
        </p>
        
      </div>
    </div>
  );
};

export default Login;
