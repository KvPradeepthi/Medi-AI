import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight, Chrome } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Login failed");
    }
  };

  // Google Login Simulation
  const handleGoogleLogin = async (role: "patient" | "doctor" | "admin") => {
    setError("");
    setIsLoading(true);
    
    // Choose simulation credentials
    const simulatedPayloads = {
      patient: { email: "likhitha.patient@gmail.com", name: "Likhitha Patel", sub: "google_p_12345" },
      doctor: { email: "dr.sharma@hospital.com", name: "Dr. Ajay Sharma", sub: "google_d_67890" },
      admin: { email: "admin.mediai@gmail.com", name: "Admin Portal Owner", sub: "google_a_54321" },
    };

    const payload = simulatedPayloads[role];
    const base64Token = btoa(JSON.stringify(payload));

    try {
      await login(payload.email, undefined, base64Token);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Google Authentication simulation failed.");
    }
  };

  return (
    <div className="bg-[#0a0f1d] min-h-screen flex items-center justify-center p-6 select-none relative">
      <div className="absolute w-80 h-80 bg-emerald-500/5 blur-[140px] rounded-full top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-blue-500/5 blur-[140px] rounded-full bottom-10 right-10"></div>

      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full max-w-md relative z-10 border border-slate-800/80">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 rounded-2xl bg-emerald-500 text-slate-900 emerald-glow mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Access your personalized health logs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-slate-800/80"></div>
          <span className="relative z-10 px-3 bg-[#0c1223] text-xs font-semibold text-slate-500 uppercase">
            Demo SSO Quick Login
          </span>
        </div>

        {/* Quick Multi-role Logins for Reviewers */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleGoogleLogin("patient")}
            className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-850 rounded-xl text-[10px] font-bold text-emerald-400 transition"
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => handleGoogleLogin("doctor")}
            className="py-2 px-1 text-center bg-slate-900/60 hover:bg-slate-800/60 border border-slate-850 rounded-xl text-[10px] font-bold text-blue-400 transition"
          >
            Doctor
          </button>
          <button
            type="button"
            onClick={() => handleGoogleLogin("admin")}
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
