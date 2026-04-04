type SummaryCardProps = {
  label: string;
  value: string;
  help?: string;
};

export function SummaryCard({ label, value, help }: SummaryCardProps) {
  return (
    <article className="card kpi-card">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {help ? <span className="small muted" style={{ marginTop: 8 }}>{help}</span> : null}
    </article>
  );
}
