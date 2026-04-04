import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
};

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <article className={`panel-stat-card ${tone === "danger" ? "danger" : ""}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="panel-stat-icon">
        <Icon size={20} />
      </div>
    </article>
  );
}
