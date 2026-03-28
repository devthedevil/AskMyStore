import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: "indigo" | "green" | "amber" | "rose" | "blue" | "purple";
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    border: "border-indigo-100",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    border: "border-amber-100",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-100 text-rose-600",
    border: "border-rose-100",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    border: "border-blue-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    border: "border-purple-100",
  },
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  color,
}: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`bg-white rounded-2xl border ${colors.border} p-6 hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-semibold ${
                  trendUp ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
