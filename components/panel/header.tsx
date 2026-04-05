import { CalendarRange } from "lucide-react";
import { PanelBrand } from "@/components/panel/brand";

type PanelHeaderProps = {
  title: string;
  subtitle: string;
  monthRef?: string;
};

function formatMonth(monthRef?: string) {
  if (!monthRef) return null;
  const [year, month] = monthRef.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function PanelHeader({ title, subtitle, monthRef }: PanelHeaderProps) {
  const monthLabel = formatMonth(monthRef);

  return (
    <header className="panel-header card">
      <div className="panel-header-top refined">
        <PanelBrand />

        {monthLabel ? (
          <div className="panel-month-chip">
            <CalendarRange size={14} />
            <span>{monthLabel}</span>
          </div>
        ) : null}
      </div>

      <div className="panel-header-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
