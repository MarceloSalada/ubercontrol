import { Shield, TrendingUp } from "lucide-react";

export function PanelBrand() {
  return (
    <div className="panel-brand">
      <div className="panel-brand-icon">
        <Shield size={28} strokeWidth={1.8} />
        <TrendingUp size={14} className="panel-brand-trend" strokeWidth={2.2} />
      </div>
      <div>
        <strong>Uber Control</strong>
        <span>controle financeiro</span>
      </div>
    </div>
  );
}
