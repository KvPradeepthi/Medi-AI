import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, reminderAPI, reportAPI } from "../services/api";
import { IMedicineReminder, IReport } from "../types";
import DashboardCard from "../components/ui/DashboardCard";
import {
  Heart,
  Droplet,
  CheckCircle,
  FileText,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Brain,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [healthScore, setHealthScore] = useState<number>(85);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>({
    bmi: 90,
    sugar: 85,
    heart: 95,
    bloodPressure: 90,
    compliance: 80,
    activity: 75,
  });
  const [aiSuggestions, setAiSuggestions] = useState<string>(
    "Everything is stable. Maintain your medication logs and stay hydrated!"
  );
  
  const [reminders, setReminders] = useState<IMedicineReminder[]>([]);
  const [complianceRate, setComplianceRate] = useState<number>(100);
  const [reports, setReports] = useState<IReport[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0.75); // in liters
  const [waterTarget] = useState<number>(2.5); // target liters
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Get health dashboard metrics and score breakdown
      const metricsRes = await userAPI.getPatientDashboard();
      setHealthScore(metricsRes.data.scoreBreakdown.overall);
      setScoreBreakdown(metricsRes.data.scoreBreakdown);
      setAiSuggestions(metricsRes.data.aiSuggestions);

      // 2. Get medicine reminders and compliance rate
      const reminderRes = await reminderAPI.get();
      setReminders(reminderRes.data.reminders);
      setComplianceRate(reminderRes.data.complianceRate);

      // 3. Get reports history
      const reportRes = await reportAPI.getHistory();
      setReports(reportRes.data.slice(0, 4)); // get top 4

      setIsLoading(false);
    } catch (err) {
      console.error("Dashboard data load error: ", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogMedicine = async (reminderId: string, slot: "morning" | "afternoon" | "night", status: "taken" | "skipped") => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      await reminderAPI.updateLog(reminderId, {
        date: todayStr,
        slot,
        status,
      });
      // Refresh dashboard metrics
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to update reminder log: ", err);
    }
  };

  const handleAddWater = () => {
    setWaterIntake((prev) => Math.min(waterTarget, prev + 0.25)); // +250ml
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      </div>
    );
  }

  // Get color for overall health score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Brand Grid Banner */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Overall Health Score Card */}
        <div className="glass-panel p-6 rounded-3xl md:col-span-2 border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
              <Layers className="w-3 h-3" />
              Fitbit Health Index
            </div>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">Today's Health Score</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Your overall health index is aggregated based on BMI, blood markers, and medicine compliance.
            </p>
            
            {/* Health Score Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">BMI</span>
                <span className="text-sm font-bold text-slate-300">{scoreBreakdown.bmi}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Sugar</span>
                <span className="text-sm font-bold text-slate-300">{scoreBreakdown.sugar}</span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">BP</span>
                <span className="text-sm font-bold text-slate-300">{scoreBreakdown.bloodPressure}</span>
              </div>
            </div>
          </div>

          {/* Glowing Health Score Circular Indicator */}
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-slate-800 bg-slate-950/40">
            <div className="absolute w-28 h-28 bg-emerald-500/5 blur-lg rounded-full pulse-glow"></div>
            <div className="text-center relative z-10">
              <span className={`text-4xl font-extrabold font-display ${getScoreColorClass(healthScore)}`}>
                {healthScore}
              </span>
              <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Index</span>
            </div>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-3 mb-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">MediAI Suggestions</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed italic">
            "{aiSuggestions}"
          </p>
          <div className="mt-4 flex justify-end">
            <button onClick={() => navigate("/assistant")} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              Ask Assistant
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
      </div>

      {/* Vitals metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Medicine Compliance" value={`${complianceRate}%`} icon={CheckCircle} color="emerald" trend="7d running log rate" />
        <DashboardCard title="Heart Pulse" value="72 bpm" icon={Heart} color="blue" trend="ECG diagnostic rate" />
        <DashboardCard title="Blood Pressure" value="120/80" icon={Activity} color="yellow" trend="Last log check normal" />
        <DashboardCard title="Reports Filed" value={reports.length} icon={FileText} color="emerald" trend="Uploaded in ChromaDB" />
      </div>

      {/* Main Grid: Medicine logs and reports */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Today's Medicine compliance list */}
        <div className="glass-panel p-6 rounded-3xl md:col-span-2 border border-slate-800">
          <h3 className="text-lg font-bold font-display text-white tracking-tight mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Today's Medications Log
          </h3>
          
          {reminders.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-850 rounded-2xl">
              <p className="text-slate-500 text-xs">No medication reminders filed for today.</p>
              <button onClick={() => navigate("/appointments")} className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Book Consultation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((rem) => {
                const todayStr = new Date().toISOString().split("T")[0];
                return (
                  <div key={rem._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/50 border border-slate-850 rounded-2xl gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{rem.medicineName}</h4>
                      <p className="text-xs text-slate-500">{rem.dosage} • {rem.frequency}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {rem.timing.map((slot) => {
                        const logged = rem.logs.find((l) => l.date === todayStr && l.slot === slot);
                        const isTaken = logged?.status === "taken";
                        
                        return (
                          <button
                            key={slot}
                            onClick={() => handleLogMedicine(rem._id, slot, isTaken ? "skipped" : "taken")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                              isTaken
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-white"
                            }`}
                          >
                            {slot}: {isTaken ? "Taken" : "Log Taken"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Water intake tracker card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-fit min-h-[300px]">
          <div>
            <h3 className="text-lg font-bold font-display text-white tracking-tight mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-400" />
              Hydration Tracker
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Track your daily target to maintain metabolic performance and hydration status.
            </p>
            
            {/* Water progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{waterIntake.toFixed(2)}L</span>
                <span className="text-slate-500">Target: {waterTarget}L</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(waterIntake / waterTarget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddWater}
            disabled={waterIntake >= waterTarget}
            className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Glass (+250ml)
          </button>
        </div>
        
      </div>

      {/* Recent reports list timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Recent Diagnostic Reports
          </h3>
          <button onClick={() => navigate("/history")} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
            View All Reports
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 border border-slate-850 rounded-2xl">
            <p className="text-slate-500 text-xs">No reports uploaded yet. Let's upload a lab test report to run AI analysis!</p>
            <button onClick={() => navigate("/upload")} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10">
              Upload Report
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((rep) => {
              const severity = rep.aiAnalysis.severity;
              const severityColor =
                severity === "RED"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : severity === "YELLOW"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              
              return (
                <div
                  key={rep._id}
                  onClick={() => navigate(`/reports/${rep._id}`)}
                  className="bg-slate-900/50 p-4 border border-slate-850 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${severityColor} mb-3`}>
                      {severity} Severity
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{rep.fileName}</h4>
                    <p className="text-[10px] text-slate-500">{rep.reportType} • {rep.createdAt.split("T")[0]}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 hover:underline">
                    View AI analysis
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default PatientDashboard;
