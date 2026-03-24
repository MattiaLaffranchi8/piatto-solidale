import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconColor?: string;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon, iconColor = "var(--primary)", trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-[var(--radius-md)] p-6 shadow-ps-sm">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
      >
        {icon}
      </div>
      <div className="font-heading text-3xl text-[var(--foreground)] mb-1">{value}</div>
      <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
      {trend && (
        <div className={`mt-3 text-xs flex items-center gap-1 ${trend.value >= 0 ? "text-[var(--color-success)]" : "text-[var(--destructive)]"}`}>
          <span>{trend.value >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
