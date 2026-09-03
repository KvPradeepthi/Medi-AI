import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  ClipboardList,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Stethoscope
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const patientLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "MediAI Assistant", path: "/assistant", icon: Sparkles },
    { name: "Upload Report", path: "/upload", icon: FileText },
    { name: "Report History", path: "/history", icon: ClipboardList },
    { name: "Consultation Chat", path: "/chat", icon: MessageSquare },
    { name: "Book Appointment", path: "/appointments", icon: Calendar },
    { name: "Profile Settings", path: "/profile", icon: User },
  ];

  const doctorLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Patient Records", path: "/patients-list", icon: Stethoscope },
    { name: "Patient Chat", path: "/chat", icon: MessageSquare },
    { name: "Schedules", path: "/appointments", icon: Calendar },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Manage Doctors", path: "/manage-doctors", icon: ShieldCheck },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const links =
    user.role === "admin"
      ? adminLinks
      : user.role === "doctor"
      ? doctorLinks
      : patientLinks;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 glass-panel border-r border-slate-800 transition-transform md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full justify-between p-6">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-900 emerald-glow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                MediAI
              </span>
              <span className="block text-xs font-semibold text-emerald-400">
                Health Portal
              </span>
            </div>
          </div>

          {/* User Brief profile summary */}
          <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
              <p className="text-xs text-emerald-400 capitalize font-medium">{user.role}</p>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Control Action */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
