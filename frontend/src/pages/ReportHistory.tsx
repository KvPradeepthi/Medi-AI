import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI } from "../services/api";
import { IReport } from "../types";
import { FileText, Calendar, ArrowLeft, Search, ChevronRight } from "lucide-react";

const ReportHistory: React.FC = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState<IReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await reportAPI.getHistory();
        setReports(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load reports history: ", err);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredReports = reports.filter((rep) =>
    rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Report History Timeline</h2>
          <p className="text-xs text-slate-400">Search and review previously indexed medical analysis files</p>
        </div>
      </div>

      {/* Timeline view */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        
        {/* Search header controls */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search report by name, file type (e.g. CBC, blood test)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl text-xs text-white placeholder-slate-500"
          />
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/20 rounded-2xl border border-slate-850">
            <FileText className="w-12 h-12 text-slate-650 mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">No reports matched your search details.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800/80 ml-4 pl-6 space-y-6">
            {filteredReports.map((rep) => {
              const severity = rep.aiAnalysis.severity;
              const severityColor =
                severity === "RED"
                  ? "bg-rose-500 text-rose-950 border-rose-500/20"
                  : severity === "YELLOW"
                  ? "bg-yellow-500 text-yellow-950 border-yellow-500/20"
                  : "bg-emerald-500 text-emerald-950 border-emerald-500/20";
              
              return (
                <div key={rep._id} className="relative group">
                  
                  {/* Timeline point dot */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 ${severityColor}`}></div>
                  
                  {/* Timeline content row block */}
                  <div
                    onClick={() => navigate(`/reports/${rep._id}`)}
                    className="p-5 bg-slate-900/40 border border-slate-850 hover:border-emerald-500/20 rounded-2xl cursor-pointer hover:bg-slate-900/80 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                          {rep.fileName}
                        </h4>
                        <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase border ${
                          severity === "RED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : severity === "YELLOW" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {severity} severity
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Filed: {rep.createdAt.split("T")[0]}
                        </span>
                        <span>•</span>
                        <span>Type: {rep.reportType}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition" />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ReportHistory;
