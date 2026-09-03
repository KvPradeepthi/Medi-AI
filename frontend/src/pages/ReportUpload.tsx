import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI } from "../services/api";
import { IReport } from "../types";
import { FileUp, FileText, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft } from "lucide-react";

const ReportUpload: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<string>("CBC");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // Stored analysis output preview
  const [reportResult, setReportResult] = useState<IReport | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setIsUploading(true);
    setReportResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportType", reportType);

    try {
      const response = await reportAPI.upload(formData);
      setReportResult(response.data.report);
      setIsUploading(false);
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setError(err.response?.data?.message || err.message || "Failed to upload and analyze report.");
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "RED":
        return {
          card: "bg-rose-500/10 border-rose-500/20",
          text: "text-rose-400",
          icon: AlertCircle,
        };
      case "YELLOW":
        return {
          card: "bg-yellow-500/10 border-yellow-500/20",
          text: "text-yellow-400",
          icon: AlertTriangle,
        };
      default:
        return {
          card: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-400",
          icon: CheckCircle,
        };
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Upload Diagnostic Report</h2>
          <p className="text-xs text-slate-400">Process PDF or image reports for automated AI explanation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Upload Form Box (Left side) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 h-fit">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Report Details</h3>

          {error && (
            <div className="mb-4 p-4 bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CBC">Complete Blood Count (CBC)</option>
                <option value="Blood Test">General Blood Test</option>
                <option value="MRI">MRI Scan</option>
                <option value="CT">CT Scan</option>
                <option value="ECG">ECG / Electrocardiogram</option>
                <option value="X-Ray">Chest X-Ray</option>
                <option value="Other">Other Diagnostic Report</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Choose File (PDF/Image)</label>
              <div className="border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 text-center cursor-pointer transition relative bg-slate-950/20">
                <input
                  type="file"
                  required
                  accept=".pdf, image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 mx-auto text-slate-500 mb-2 group-hover:text-emerald-400" />
                <span className="block text-xs font-semibold text-slate-300">
                  {file ? file.name : "Select PDF or Image file"}
                </span>
                <span className="block text-[10px] text-slate-500 mt-1">Max file size 10MB</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition duration-200 flex items-center justify-center gap-2"
            >
              {isUploading ? "Running OCR Analysis..." : "Process Report"}
            </button>
          </form>
        </div>

        {/* Report Analysis Results Display (Right side) */}
        <div className="glass-panel p-6 rounded-3xl md:col-span-2 border border-slate-800">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 h-full">
              <div className="w-12 h-12 rounded-full border-t-2 border-emerald-400 animate-spin mb-4"></div>
              <h4 className="text-sm font-bold text-white tracking-tight">AI Report Processing Engine Active</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Reading document bytes, extracting clinical markers, and translating terms into layman advice.
              </p>
            </div>
          ) : !reportResult ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 h-full">
              <FileText className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-sm font-semibold">Ready for Report Upload</p>
              <p className="text-xs text-slate-600 mt-1">Upload a lab report on the left panel to review structured AI breakdowns.</p>
            </div>
          ) : (
            /* Analysis Layout Panel */
            <div className="space-y-6">
              
              {/* Header metrics card */}
              {(() => {
                const styles = getSeverityStyles(reportResult.aiAnalysis.severity);
                const Icon = styles.icon;
                return (
                  <div className={`p-5 border rounded-2xl ${styles.card} flex items-center justify-between`}>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Diagnosis Severity</span>
                      <h3 className={`text-base font-extrabold flex items-center gap-1.5 ${styles.text}`}>
                        <Icon className="w-5 h-5" />
                        {reportResult.aiAnalysis.severity} Alert status
                      </h3>
                    </div>
                    
                    <a
                      href={reportResult.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-[10px] font-bold text-slate-400"
                    >
                      View Original File
                    </a>
                  </div>
                );
              })()}

              {/* Summary explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Summary</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/20 p-4 border border-slate-850 rounded-xl">
                  {reportResult.aiAnalysis.summary}
                </p>
              </div>

              {/* Abnormal Values Table list */}
              {reportResult.aiAnalysis.abnormalValues && reportResult.aiAnalysis.abnormalValues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Abnormal Markers</h4>
                  <div className="space-y-2">
                    {reportResult.aiAnalysis.abnormalValues.map((v, idx) => {
                      const color = v.severity === "RED" ? "text-rose-400 border-rose-500/10 bg-rose-500/5" : "text-yellow-400 border-yellow-500/10 bg-yellow-500/5";
                      return (
                        <div key={idx} className={`p-4 border rounded-xl flex justify-between gap-4 items-center ${color}`}>
                          <div>
                            <h5 className="text-xs font-bold">{v.marker}: {v.value}</h5>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{v.explanation}</p>
                          </div>
                          <span className="text-[8px] font-bold uppercase px-2 py-0.5 border rounded-full shrink-0">
                            {v.severity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Suggestions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                    {reportResult.aiAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foods to Focus</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {reportResult.aiAnalysis.foods.map((food, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Steps</h4>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {reportResult.aiAnalysis.nextSteps}
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
      
    </div>
  );
};

export default ReportUpload;
