import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { User, ClipboardCheck } from "lucide-react";

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [age, setAge] = useState(user?.age?.toString() || "");
  const [gender, setGender] = useState(user?.gender || "Male");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Emergency Contact details
  const [ecName, setEcName] = useState(user?.emergencyContact?.name || "");
  const [ecPhone, setEcPhone] = useState(user?.emergencyContact?.phone || "");
  const [ecRelationship, setEcRelationship] = useState(user?.emergencyContact?.relationship || "");

  // Arrays
  const [medicalHistoryInput, setMedicalHistoryInput] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<string[]>(user?.medicalHistory || []);
  const [allergiesInput, setAllergiesInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await userAPI.updateProfile({
        age: age ? parseInt(age) : undefined,
        gender,
        bloodGroup,
        phone,
        medicalHistory,
        allergies,
        emergencyContact: {
          name: ecName,
          phone: ecPhone,
          relationship: ecRelationship,
        },
      });

      await refreshUser();
      setSuccess("Profile settings updated successfully!");
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile settings.");
      setIsSaving(false);
    }
  };

  const handleAddCondition = () => {
    if (medicalHistoryInput.trim() && !medicalHistory.includes(medicalHistoryInput.trim())) {
      setMedicalHistory((prev) => [...prev, medicalHistoryInput.trim()]);
      setMedicalHistoryInput("");
    }
  };

  const handleAddAllergy = () => {
    if (allergiesInput.trim() && !allergies.includes(allergiesInput.trim())) {
      setAllergies((prev) => [...prev, allergiesInput.trim()]);
      setAllergiesInput("");
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      <div>
        <h2 className="text-xl font-bold font-display text-white tracking-tight">Profile & Medical Details</h2>
        <p className="text-xs text-slate-400">Configure personal biological metrics and emergency contacts</p>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 max-w-3xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Base details section */}
          <div className="grid sm:grid-cols-2 gap-4 border-b border-slate-800/60 pb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Profile Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ""}
                className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500"
              />
            </div>
          </div>

          {user?.role === "patient" && (
            <>
              {/* Biological statistics */}
              <div className="grid grid-cols-3 gap-4 border-b border-slate-800/60 pb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
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
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-b border-slate-800/60 pb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Emergency Dispatch Contact</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Name</label>
                    <input
                      type="text"
                      placeholder="Emergency Contact Name"
                      value={ecName}
                      onChange={(e) => setEcName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={ecPhone}
                      onChange={(e) => setEcPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Brother"
                      value={ecRelationship}
                      onChange={(e) => setEcRelationship(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lists inputs */}
              <div className="grid sm:grid-cols-2 gap-6 border-b border-slate-800/60 pb-6">
                
                {/* Medical conditions list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chronic Conditions</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add Condition (e.g. Diabetes)"
                      value={medicalHistoryInput}
                      onChange={(e) => setMedicalHistoryInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold rounded-xl text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {medicalHistory.map((item) => (
                      <span key={item} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg flex items-center gap-1.5">
                        {item}
                        <button
                          type="button"
                          onClick={() => setMedicalHistory((prev) => prev.filter((i) => i !== item))}
                          className="text-rose-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Allergies list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add Allergy (e.g. Peanuts)"
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllergy}
                      className="px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold rounded-xl text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((item) => (
                      <span key={item} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg flex items-center gap-1.5">
                        {item}
                        <button
                          type="button"
                          onClick={() => setAllergies((prev) => prev.filter((i) => i !== item))}
                          className="text-rose-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Save Profile Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            {isSaving ? "Saving details..." : "Save Bio Profile"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;
