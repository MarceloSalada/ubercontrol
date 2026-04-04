import { deleteDailyEntryAction } from "@/app/dashboard/actions";
import { formatCurrency } from "@/lib/utils/format";

type Entry = {
  id: string;
  date: string;
  gross: number;
  km: number;
  fuel_cost: number;
  extras: number;
  profit: number;
};

type EntriesListProps = {
  entries: Entry[];
  monthRef: string;
};

export function EntriesList({ entries, monthRef }: EntriesListProps) {
  return (
    <section className="card">
      <h2 className="section-title">Registro do mês</h2>

      {entries.length === 0 ? (
        <p className="muted">Nenhuma diária lançada neste mês ainda.</p>
      ) : (
        <div className="grid">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="card"
              style={{ background: "rgba(17, 24, 39, 0.85)", padding: 16, borderRadius: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>{new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR")}</strong>
                  <div className="small muted" style={{ marginTop: 6 }}>
                    Ganho: {formatCurrency(entry.gross)} • KM: {entry.km}
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    Combustível: {formatCurrency(entry.fuel_cost)} • Extras: {formatCurrency(entry.extras)}
                  </div>
                  <div style={{ marginTop: 8, color: "#93c5fd", fontWeight: 700 }}>
                    Lucro: {formatCurrency(entry.profit)}
                  </div>
                </div>

                <form action={deleteDailyEntryAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="month" value={monthRef} />
                  <button type="submit" className="secondary-btn">
                    Excluir
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
