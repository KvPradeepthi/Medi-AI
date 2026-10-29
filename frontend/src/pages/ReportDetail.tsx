import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportAPI } from "../services/api";
import { IReport } from "../types";
import {
  FileText,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Download,
  MessageSquare,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<IReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setIsLoading(false);
      try {
        const response = await reportAPI.getDetails(id);
        setReport(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch report details:", err);
        setError(err.response?.data?.message || "Failed to load report analysis.");
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "RED":
        return {
          card: "bg-rose-500/10 border-rose-500/25",
          badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          text: "text-rose-400",
          icon: AlertCircle,
        };
      case "YELLOW":
        return {
          card: "bg-yellow-500/10 border-yellow-500/25",
          badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
          text: "text-yellow-400",
          icon: AlertTriangle,
        };
      default:
        return {
          card: "bg-emerald-500/10 border-emerald-500/25",
          badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          text: "text-emerald-400",
          icon: CheckCircle,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Loading clinical report analysis...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white">Report Not Found</h3>
        <p className="text-xs text-slate-400">{error || "The requested diagnostic report could not be located."}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate("/history")}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
          >
            Back to Timeline
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400"
          >
            Upload New Report
          </button>
        </div>
      </div>
    );
  }

  const styles = getSeverityStyles(report.aiAnalysis.severity);
  const SeverityIcon = styles.icon;

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/history")}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title="Back to History"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white tracking-tight">{report.fileName}</h2>
              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase border ${styles.badge}`}>
                {report.aiAnalysis.severity} Alert
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Recent"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                Type: {report.reportType}
              </span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          {report.fileUrl && (
            <a
              href={report.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Original File
            </a>
          )}
          <button
            onClick={() => navigate("/chat")}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            Discuss with Doctor
          </button>
        </div>
      </div>

      {/* Severity Alert banner */}
      <div className={`p-5 rounded-2xl border ${styles.card} flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950/40 shrink-0">
            <SeverityIcon className={`w-6 h-6 ${styles.text}`} />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${styles.text}`}>
              {report.aiAnalysis.severity === "RED"
                ? "Immediate Clinical Attention Advised"
                : report.aiAnalysis.severity === "YELLOW"
                ? "Mild Clinical Variances Detected"
                : "Parameters Within Normal Range"}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated AI diagnostic synthesis based on extracted laboratory markers.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Clinical Summary & Explanation
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/30 p-4 border border-slate-850 rounded-2xl">
          {report.aiAnalysis.summary}
        </p>
      </div>

      {/* Detected Abnormal Markers */}
      {report.aiAnalysis.abnormalValues && report.aiAnalysis.abnormalValues.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Detected Abnormal Markers ({report.aiAnalysis.abnormalValues.length})
          </h4>
          <div className="space-y-2.5">
            {report.aiAnalysis.abnormalValues.map((v, idx) => {
              const isRed = v.severity === "RED";
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex justify-between gap-4 items-center ${
                    isRed
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                      : "bg-yellow-500/10 border-yellow-500/25 text-yellow-300"
                  }`}
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">
                      {v.marker}: <span className={isRed ? "text-rose-400" : "text-yellow-400"}>{v.value}</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{v.explanation}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                      isRed
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {v.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations & Foods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Recommendations</h4>
          <ul className="space-y-2">
            {report.aiAnalysis.recommendations && report.aiAnalysis.recommendations.length > 0 ? (
              report.aiAnalysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No specific medical actions required.</li>
            )}
          </ul>
        </div>

        {/* Dietary suggestions */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foods to Focus</h4>
          <div className="flex flex-wrap gap-2">
            {report.aiAnalysis.foods && report.aiAnalysis.foods.length > 0 ? (
              report.aiAnalysis.foods.map((food, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl"
                >
                  🥗 {food}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Continue regular balanced hydration and diet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Next steps advice */}
      {report.aiAnalysis.nextSteps && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Next Steps</h4>
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/30 p-3.5 border border-slate-850 rounded-xl">
            {report.aiAnalysis.nextSteps}
          </p>
        </div>
      )}

      {/* Extracted raw OCR text accordion */}
      {report.extractedText && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <button
            onClick={() => setShowExtractedText(!showExtractedText)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white transition"
          >
            <span>Raw Extracted Document Text</span>
            {showExtractedText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showExtractedText && (
            <pre className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-[11px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed mt-2">
              {report.extractedText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
