type MonthSelectorProps = {
  currentMonth: string;
};

function shiftMonth(monthRef: string, offset: number) {
  const [year, month] = monthRef.split("-").map(Number);
  const date = new Date(year, (month - 1) + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const previous = shiftMonth(currentMonth, -1);
  const next = shiftMonth(currentMonth, 1);

  return (
    <section className="card" style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
      <div>
        <h2 className="section-title" style={{ marginBottom: 6 }}>Período analisado</h2>
        <p className="muted">Use os atalhos ou selecione manualmente o mês do dashboard.</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a className="secondary-btn" href={`/dashboard?month=${previous}`}>
          Mês anterior
        </a>
        <a className="secondary-btn" href={`/dashboard?month=${next}`}>
          Próximo mês
        </a>
        <form action="/dashboard" method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" type="month" name="month" defaultValue={currentMonth} style={{ minWidth: 180 }} />
          <button type="submit" className="primary-btn">Aplicar</button>
        </form>
      </div>
    </section>
  );
}
