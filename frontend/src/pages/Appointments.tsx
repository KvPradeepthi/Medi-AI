import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { appointmentAPI, userAPI } from "../services/api";
import { IAppointment, IUser } from "../types";
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

const Appointments: React.FC = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [doctors, setDoctors] = useState<IUser[]>([]);
  
  // Book forms
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [notes, setNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAppointments();
      setAppointments(res.data);

      if (user?.role === "patient") {
        const docRes = await userAPI.getDoctorsList("approved");
        setDoctors(docRes.data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load appointments: ", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const selectedDoc = doctors.find((d) => d._id === selectedDoctorId);
    if (!selectedDoc) {
      setError("Please select a doctor");
      return;
    }

    try {
      await appointmentAPI.book({
        doctorId: selectedDoctorId,
        hospital: selectedDoc.hospital || "City Health Hospital",
        date,
        timeSlot,
        notes,
      });

      setSuccess("Appointment booked successfully!");
      setSelectedDoctorId("");
      setDate("");
      setNotes("");
      
      // Refresh list
      await fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to book slot.");
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await appointmentAPI.cancel(id);
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel: ", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
      </div>
    );
  }

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="space-y-8 select-none">
      
      <div>
        <h2 className="text-xl font-bold font-display text-white tracking-tight">Schedules & Appointments</h2>
        <p className="text-xs text-slate-400">Manage clinical visits and checkups</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Book appointment form (Patient role only) */}
        {user?.role === "patient" && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 h-fit">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Book Consultation</h3>

            {error && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Doctor</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">Select Practitioner</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization} at {doc.hospital})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Timeslot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Consultation Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="I have mild fever and dry cough..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        )}

        {/* Appointments history list */}
        <div className={`glass-panel p-6 rounded-3xl border border-slate-800 ${
          user?.role === "patient" ? "md:col-span-2" : "md:col-span-3"
        }`}>
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Scheduled Consultation Logs</h3>

          {appointments.length === 0 ? (
            <div className="text-center py-20 bg-slate-950/20 rounded-2xl border border-slate-850">
              <CalendarIcon className="w-12 h-12 text-slate-650 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-500">No scheduled appointments filed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => {
                const partnerName = user?.role === "patient" ? app.doctorId?.name : app.patientId?.name;
                const active = app.status === "upcoming";
                
                return (
                  <div key={app._id} className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{partnerName}</h4>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === "upcoming" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : app.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                          {app.date}
                        </span>
                        <span>at</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {app.timeSlot}
                        </span>
                      </div>
                      
                      {app.notes && (
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-md italic">
                          "Notes: {app.notes}"
                        </p>
                      )}

                      {app.prescription && (
                        <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl max-w-md">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Prescribed Treatment</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">{app.prescription.advice}</p>
                          <ul className="mt-2 space-y-1">
                            {app.prescription.medicines.map((m, idx) => (
                              <li key={idx} className="text-[9px] text-slate-400">
                                • {m.name} ({m.dosage}) for {m.duration} timing: {m.timing.join(", ")}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {active && (
                      <button
                        onClick={() => handleCancelAppointment(app._id)}
                        className="self-start sm:self-center px-4 py-2 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition"
                      >
                        Cancel Slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Appointments;
