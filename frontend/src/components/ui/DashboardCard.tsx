import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string; // e.g. "emerald", "blue", "yellow", "red"
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "emerald",
}) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between h-36">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-extrabold text-white font-display tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className="text-xs text-slate-400 mt-1 block">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
