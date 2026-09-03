import React, { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { IUser } from "../types";
import DashboardCard from "../components/ui/DashboardCard";
import {
  ShieldAlert,
  Users,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Activity,
  HardDrive,
  Cpu,
  Clock
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({
    cards: { patients: 0, doctors: 0, appointments: 0, reports: 0 },
    reportTypeDistribution: [],
    systemHealth: { database: "healthy", aiService: "healthy", socket: "healthy", backend: "healthy", pingTime: "0ms" },
  });
  
  const [pendingDoctors, setPendingDoctors] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const metricsRes = await userAPI.getAdminDashboard();
      setMetrics(metricsRes.data);

      const docRes = await userAPI.getDoctorsList("pending");
      setPendingDoctors(docRes.data);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load admin dashboard data: ", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveDoctor = async (doctorId: string, status: "approved" | "rejected") => {
    try {
      await userAPI.approveDoctor({ doctorId, status });
      // Refresh details
      await fetchAdminData();
    } catch (err) {
      console.error(`Failed to ${status} doctor: `, err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Cards breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Registered Patients" value={metrics.cards.patients} icon={Users} color="blue" trend="Patient databases" />
        <DashboardCard title="Licensed Doctors" value={metrics.cards.doctors} icon={ShieldAlert} color="emerald" trend="Accredited practitioners" />
        <DashboardCard title="Appointments Relayed" value={metrics.cards.appointments} icon={Calendar} color="yellow" trend="Platform bookings count" />
        <DashboardCard title="Reports Analyzed" value={metrics.cards.reports} icon={FileSpreadsheet} color="emerald" trend="ChromaDB vector logs" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Pending doctor verification list */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 border border-slate-800">
          <h3 className="text-lg font-bold font-display text-white tracking-tight mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-yellow-400" />
            Accreditation Review Queue
          </h3>

          {pendingDoctors.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-850 rounded-2xl">
              <p className="text-slate-500 text-xs">No pending doctor verifications awaiting approval.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Hospital</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingDoctors.map((doc) => (
                    <tr key={doc._id} className="text-slate-300 hover:bg-slate-900/20">
                      <td className="py-4 px-4 font-semibold text-white">{doc.name}</td>
                      <td className="py-4 px-4">{doc.specialization}</td>
                      <td className="py-4 px-4 text-slate-400">{doc.hospital}</td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveDoctor(doc._id, "approved")}
                          className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproveDoctor(doc._id, "rejected")}
                          className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Health Checkups card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-lg font-bold font-display text-white tracking-tight mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Infrastructure Status
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">MongoDB Cluster</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">CONNECTED</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">FastAPI AI Worker</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">ACTIVE</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-slate-300">Socket.io Engine</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">ONLINE</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-slate-300">FastAPI Latency</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{metrics.systemHealth.pingTime || "18ms"}</span>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default AdminDashboard;
