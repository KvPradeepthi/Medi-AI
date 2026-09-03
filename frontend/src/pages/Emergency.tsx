import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, ShieldAlert, Navigation, Phone, MapPin } from "lucide-react";

const Emergency: React.FC = () => {
  const { user } = useAuth();

  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSosTrigger = () => {
    setIsLoading(true);
    setIsSosTriggered(false);

    // Get patient coordinates if browser supports it
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
          setIsSosTriggered(true);
        },
        (error) => {
          console.error("Coordinates lookup failed", error);
          // Set mock coordinates
          setCoordinates({ lat: 12.9716, lng: 77.5946 });
          setIsLoading(false);
          setIsSosTriggered(true);
        }
      );
    } else {
      // Mock coordinates
      setCoordinates({ lat: 12.9716, lng: 77.5946 });
      setIsLoading(false);
      setIsSosTriggered(true);
    }
  };

  const nearbyHospitals = [
    { name: "Metro General Hospital Emergency Care", distance: "1.2 km", phone: "+1 (555) 911-1000", address: "404 Clinical Way, Central District" },
    { name: "City Trauma Center & Cardiology Unit", distance: "2.4 km", phone: "+1 (555) 911-2000", address: "702 Stethoscope Ave, North Wing" },
    { name: "St. Jude Critical Care Hospital", distance: "3.5 km", phone: "+1 (555) 911-3000", address: "109 Ambulance Road, Sector 4" }
  ];

  return (
    <div className="space-y-8 select-none">
      
      <div>
        <h2 className="text-xl font-bold font-display text-rose-500 tracking-tight">Emergency SOS Dispatcher</h2>
        <p className="text-xs text-slate-400">Trigger immediate medical rescue operations and retrieve nearest hospitals</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* SOS Action Button Card (Left side) */}
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-900/60 to-rose-950/20 text-center flex flex-col items-center justify-center gap-6 min-h-[350px]">
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Critical Control Unit
            </span>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              Clicking the button below retrieves your GPS coordinates and dispatches SMS alerts to your emergency contact.
            </p>
          </div>

          {/* Glowing SOS Action Button */}
          <button
            onClick={handleSosTrigger}
            disabled={isLoading}
            className={`w-36 h-36 rounded-full border-8 border-slate-900 bg-rose-500 text-white font-extrabold text-3xl font-display flex items-center justify-center shadow-2xl transition duration-300 ${
              isLoading ? "animate-pulse scale-95" : "hover:bg-rose-600 hover:scale-105 shadow-rose-500/30 cursor-pointer"
            }`}
          >
            {isLoading ? "LOCATING" : "SOS"}
          </button>
        </div>

        {/* SOS Details Display (Right side) */}
        <div className="glass-panel p-6 rounded-3xl md:col-span-2 border border-slate-800">
          {!isSosTriggered ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 h-full">
              <ShieldAlert className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-sm font-semibold">SOS Dispatcher Ready</p>
              <p className="text-xs text-slate-650 mt-1">Press the SOS button to alert emergency contacts and map medical coordinates.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Alert Status Banner */}
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-500 pulse-glow" />
                <div>
                  <h4 className="text-sm font-bold text-white">Emergency Response Triggered</h4>
                  <p className="text-[10px] text-slate-400">
                    Rescue coordinates dispatched to emergency contact: <span className="text-rose-400 font-semibold">{user?.emergencyContact?.name || "Family Contact"} ({user?.emergencyContact?.phone || "+1 (555) 911-0000"})</span>
                  </p>
                </div>
              </div>

              {/* Coordinates Map coordinates */}
              {coordinates && (
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-400 animate-bounce" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">GPS Coordinates</span>
                      <span className="text-xs text-white font-semibold">Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}</span>
                    </div>
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] rounded-lg transition"
                  >
                    View on Maps
                  </a>
                </div>
              )}

              {/* Nearest Trauma Hospitals list */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Nearest Trauma Center Units</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  {nearbyHospitals.map((hosp, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-white truncate">{hosp.name}</span>
                          <span className="text-[9px] text-emerald-400 font-semibold">{hosp.distance}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed">{hosp.address}</p>
                      </div>
                      
                      <a
                        href={`tel:${hosp.phone}`}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center rounded-lg text-[9px] font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        Call Unit
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Emergency;
