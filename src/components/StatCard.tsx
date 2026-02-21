import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  progress: number;
  icon: LucideIcon;
  variant: "exercise" | "meals" | "sleep";
}

const StatCard = ({ title, value, unit, progress, icon: Icon, variant }: StatCardProps) => {
  const gradientClass = `gradient-${variant}`;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${gradientClass} rounded-2xl p-6 text-primary-foreground flex items-center justify-between min-h-[140px] shadow-lg`}>
      <div className="flex flex-col gap-1">
        <Icon className="w-8 h-8 opacity-90 mb-2" />
        <span className="text-sm font-medium opacity-80">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm opacity-70">{unit}</span>
        </div>
      </div>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-20" />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="opacity-90"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</span>
      </div>
    </div>
  );
};

export default StatCard;
