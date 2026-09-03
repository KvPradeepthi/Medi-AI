import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, UserPlus, HeartPulse, ShieldAlert } from "lucide-react";

const Register: React.FC = () => {
  const { registerPatient, registerDoctor } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  
  // Doctor details
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      if (role === "patient") {
        await registerPatient({
          name,
          email,
          password,
          age: age ? parseInt(age) : undefined,
          gender,
          bloodGroup,
          phone,
        });
        setIsLoading(false);
        navigate("/dashboard");
      } else {
        const doc = await registerDoctor({
          name,
          email,
          password,
          specialization,
          hospital,
        });
        setIsLoading(false);
        if (doc.status === "pending") {
          setInfo("Doctor registration requested successfully. Account is pending administrator validation.");
          setName("");
          setEmail("");
          setPassword("");
          setSpecialization("");
          setHospital("");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err || "Registration failed");
    }
  };

  return (
    <div className="bg-[#0a0f1d] min-h-screen flex items-center justify-center p-6 select-none relative">
      <div className="absolute w-80 h-80 bg-emerald-500/5 blur-[140px] rounded-full top-10 right-10"></div>
      <div className="absolute w-80 h-80 bg-blue-500/5 blur-[140px] rounded-full bottom-10 left-10"></div>

      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full max-w-lg relative z-10 border border-slate-800/80">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 rounded-2xl bg-emerald-500 text-slate-900 emerald-glow mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Onboard the MediAI clinical platform</p>
        </div>

        {/* Role toggle tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border border-slate-850 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRole("patient"); setError(""); setInfo(""); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === "patient" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            Patient Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setRole("doctor"); setError(""); setInfo(""); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === "doctor" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Doctor Credentials
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {role === "patient" ? (
            /* Patient profile form fields */
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Age</label>
                <input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Blood Group</label>
                <input
                  type="text"
                  placeholder="O+"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          ) : (
            /* Doctor credentials fields */
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="Cardiologist"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Affiliated Hospital</label>
                <input
                  type="text"
                  required
                  placeholder="City Health Center"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {role === "patient" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200"
          >
            {isLoading ? "Signing up..." : role === "patient" ? "Create Patient Account" : "Submit Doctor Credentials"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
            Sign In
          </Link>
        </p>
        
      </div>
    </div>
  );
};

export default Register;
