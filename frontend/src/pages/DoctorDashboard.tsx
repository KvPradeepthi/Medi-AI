import React, { useState, useEffect } from "react";
import { appointmentAPI, userAPI, reportAPI } from "../services/api";
import { IAppointment, IUser, IReport } from "../types";
import DashboardCard from "../components/ui/DashboardCard";
import {
  Calendar,
  Users,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  FileText,
  User,
  Plus,
  Trash2,
  ListOrdered
} from "lucide-react";

interface IPrescriptionForm {
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    timing: ("morning" | "afternoon" | "night")[];
  }[];
  advice: string;
}

const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [patients, setPatients] = useState<IUser[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
  
  // Prescription pad states
  const [prescriptionForm, setPrescriptionForm] = useState<IPrescriptionForm>({
    medicines: [{ name: "", dosage: "", duration: "", timing: ["morning"] }],
    advice: "",
  });
  
  const [patientReports, setPatientReports] = useState<IReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctorData = async () => {
    try {
      const appRes = await appointmentAPI.getAppointments();
      setAppointments(appRes.data);

      const patRes = await userAPI.getPatientsList();
      setPatients(patRes.data);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load doctor dashboard data: ", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleSelectAppointment = async (app: IAppointment) => {
    setSelectedAppointment(app);
    setPatientReports([]);
    
    // Fetch reports of this specific patient for clinical review!
    try {
      const repRes = await reportAPI.getHistory(app.patientId._id);
      setPatientReports(repRes.data);
    } catch (err) {
      console.error("Failed to fetch patient reports: ", err);
    }
  };

  const handleAddMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "", timing: ["morning"] }],
    }));
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (prescriptionForm.medicines.length === 1) return;
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const updatedMeds = [...prescriptionForm.medicines];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setPrescriptionForm((prev) => ({ ...prev, medicines: updatedMeds }));
  };

  const handleTimingToggle = (index: number, slot: "morning" | "afternoon" | "night") => {
    const updatedMeds = [...prescriptionForm.medicines];
    const timings = updatedMeds[index].timing;
    if (timings.includes(slot)) {
      updatedMeds[index].timing = timings.filter((t) => t !== slot);
    } else {
      updatedMeds[index].timing = [...timings, slot];
    }
    setPrescriptionForm((prev) => ({ ...prev, medicines: updatedMeds }));
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await appointmentAPI.prescribe(selectedAppointment._id, prescriptionForm);
      setSelectedAppointment(null);
      setPrescriptionForm({
        medicines: [{ name: "", dosage: "", duration: "", timing: ["morning"] }],
        advice: "",
      });
      // Refresh
      await fetchDoctorData();
    } catch (err) {
      console.error("Failed to prescribe medicines: ", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      </div>
    );
  }

  const upcomingCount = appointments.filter((a) => a.status === "upcoming").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-8 select-none">
      
      {/* Visual metric stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardCard title="Today's Consultations" value={upcomingCount} icon={Calendar} color="blue" trend="Scheduled bookings" />
        <DashboardCard title="Total Patients" value={patients.length} icon={Users} color="emerald" trend="Assigned patient profiles" />
        <DashboardCard title="Completed Checkups" value={completedCount} icon={CheckCircle} color="emerald" trend="Consultations history" />
        <DashboardCard title="Pending Review" value={appointments.filter((a) => a.status === "upcoming" && !a.prescription).length} icon={Clock} color="yellow" trend="Awaiting prescriptions" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Appointments patient list (Left side column) */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-1 border border-slate-800 h-fit max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-bold font-display text-white tracking-tight mb-4 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-400" />
            Patient Queue
          </h3>
          
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No consultation appointments booked.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((app) => (
                <div
                  key={app._id}
                  onClick={() => handleSelectAppointment(app)}
                  className={`p-4 border rounded-2xl cursor-pointer transition ${
                    selectedAppointment?._id === app._id
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-slate-900/50 border-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-white truncate">{app.patientId.name}</h4>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                      app.status === "upcoming" ? "bg-blue-500/15 text-blue-400" : "bg-emerald-500/15 text-emerald-400"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{app.date} at {app.timeSlot}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected consultation pad (Right side) */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 border border-slate-800">
          {!selectedAppointment ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 h-full">
              <Calendar className="w-12 h-12 mb-4 text-slate-600" />
              <p className="text-sm font-semibold">Select a patient from the queue to start consult.</p>
              <p className="text-xs text-slate-600 mt-1">Review lab reports and write prescriptions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Patient details banner */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-850 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 font-bold rounded-xl flex items-center justify-center">
                  {selectedAppointment.patientId.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedAppointment.patientId.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    Age {selectedAppointment.patientId.age || "N/A"} • {selectedAppointment.patientId.gender || "N/A"} • Blood {selectedAppointment.patientId.bloodGroup || "N/A"}
                  </p>
                </div>
              </div>

              {/* Patient lab reports timeline review */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Patient Lab Reports ({patientReports.length})</h4>
                {patientReports.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic">No reports filed by this patient.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2">
                    {patientReports.map((rep) => (
                      <a
                        key={rep._id}
                        href={rep.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl hover:border-blue-500/30 transition flex items-center justify-between"
                      >
                        <div className="truncate">
                          <h5 className="text-[10px] font-bold text-white truncate">{rep.fileName}</h5>
                          <span className="text-[9px] text-slate-500">{rep.reportType}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                          rep.aiAnalysis.severity === "RED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {rep.aiAnalysis.severity}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Prescription Pad Form */}
              <form onSubmit={handleSubmitPrescription} className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescribed Medicines</h4>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Med
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptionForm.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-950/40 p-3 border border-slate-850 rounded-xl items-center">
                      <input
                        type="text"
                        required
                        placeholder="Medicine Name"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Dosage (e.g. 1 tab)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                      
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex gap-1">
                          {["morning", "afternoon", "night"].map((slot) => {
                            const active = med.timing.includes(slot as any);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimingToggle(idx, slot as any)}
                                className={`px-2 py-1 text-[8px] font-bold uppercase rounded border transition ${
                                  active
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-slate-900 text-slate-500 border-slate-800"
                                }`}
                              >
                                {slot.substring(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-400">Clinical Advice / Notes</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide dietary guidelines, precautions, and follow-up warnings..."
                    value={prescriptionForm.advice}
                    onChange={(e) => setPrescriptionForm((prev) => ({ ...prev, advice: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition duration-200"
                >
                  Submit Clinical Prescription
                </button>
              </form>
              
            </div>
          )}
        </div>

      </div>
      
    </div>
  );
};

export default DoctorDashboard;
