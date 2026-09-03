import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Stethoscope, ShieldCheck, HeartPulse, PhoneCall, BrainCircuit } from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#0a0f1d] min-h-screen text-slate-100 selection:bg-emerald-500 selection:text-slate-900">
      
      {/* Navbar header brand */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-900 emerald-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-xl text-white tracking-tight">MediAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-all">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-200">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-6">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI-Powered Healthcare Ecosystem
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white leading-tight tracking-tight mb-6">
            Your Premium <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              AI Health Assistant
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
            MediAI is an enterprise health portal providing OCR diagnostic report parsing, RAG-driven health summaries, daily medicine compliance checkups, and real-time consultation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-200">
              Register Account
            </Link>
            <a href="#features" className="px-6 py-3.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-sm rounded-xl transition-all">
              Explore Features
            </a>
          </div>
        </div>
        
        {/* Abstract dashboard preview graphics */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-72 h-72 bg-emerald-500/10 blur-[120px] rounded-full"></div>
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-slate-800 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-white text-sm">Health Status</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-semibold text-xs rounded-full">Normal Range</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400 font-medium">Daily Compliance</span>
                <span className="text-sm font-bold text-white">96%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400 font-medium">Sugar Level</span>
                <span className="text-sm font-bold text-white">98 mg/dL</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400 font-medium">Blood Pressure</span>
                <span className="text-sm font-bold text-white">118/75 mmHg</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <span className="text-xs text-slate-500">Secure AES-256 data logs encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/40">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight mb-4">
            Unified Clinical Modules
          </h2>
          <p className="text-slate-400 text-sm">
            Experience role-based medical automation powered by state-of-the-art Generative AI.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit rounded-xl mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">MediAI RAG Assistant</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ask queries about your historical reports. MediAI indexes your files in ChromaDB for instant diagnostic context search.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit rounded-xl mb-6">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Clinical Portal</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Doctors write prescriptions, timeline client logs histories, and follow up consultations via private Socket.io rooms.
            </p>
          </div>
          <div className="glass-panel p-8 rounded-2xl">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit rounded-xl mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Admin Dashboard</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Monitor active server statuses, database connections, and review doctor accreditation reviews before onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900 py-12 text-center text-slate-500 text-xs">
        <p>© 2026 MediAI Health Portal. Designed for professional portfolio showcase.</p>
      </footer>
      
    </div>
  );
};

export default LandingPage;
