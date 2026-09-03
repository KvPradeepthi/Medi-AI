import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, AlertOctagon } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-800">
      {/* Mobile Toggle Drawer Trigger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Greetings block */}
      <div className="hidden md:block">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Welcome back, <span className="text-emerald-400">{user.name}</span>
        </h2>
        <p className="text-xs text-slate-400">
          Your personal AI health suite is online and secured.
        </p>
      </div>

      {/* Header controls actions */}
      <div className="flex items-center gap-4">
        {/* SOS Emergency button visible only to Patient role */}
        {user.role === "patient" && (
          <button
            onClick={() => navigate("/emergency")}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 pulse-glow transition-all duration-200"
          >
            <AlertOctagon className="w-4 h-4" />
            EMERGENCY SOS
          </button>
        )}

        {/* Notifications Tray Icon */}
        <button className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
