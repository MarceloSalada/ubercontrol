import { PanelHeader } from "@/components/panel/header";
import { createPanelEntryAction, deletePanelEntryAction } from "@/app/panel/actions";
import { currentMonthRef, getMonthBundle, getPanelSession } from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function PanelEntriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { user } = await getPanelSession();
  const { entries } = await getMonthBundle(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Lançamentos"
        subtitle="Cadastre as diárias do período."
        monthRef={monthRef}
      />

      {params?.error ? <div className="panel-info error">{params.error}</div> : null}
      {params?.success ? <div className="panel-info success">{params.success}</div> : null}

      <section className="panel-card">
        <h2 className="section-title">Nova diária</h2>

        <form action={createPanelEntryAction} className="panel-form two-col">
          <label>
            <span>Data</span>
            <input type="date" name="date" defaultValue={`${monthRef}-01`} required />
          </label>

          <label>
            <span>Ganho bruto</span>
            <input type="text" name="gross" inputMode="decimal" required />
          </label>

          <label>
            <span>KM rodado</span>
            <input type="text" name="km" inputMode="decimal" required />
          </label>

          <label>
            <span>Preço combustível</span>
            <input type="text" name="fuel_price" inputMode="decimal" required />
          </label>

          <label>
            <span>Consumo (km/L)</span>
            <input type="text" name="consumption" inputMode="decimal" required />
          </label>

          <label>
            <span>Extras</span>
            <input type="text" name="extras" inputMode="decimal" />
          </label>

          <div className="full">
            <SubmitButton
              idleLabel="Salvar lançamento"
              pendingLabel="Salvando..."
              className="panel-button"
            />
          </div>
        </form>
      </section>

      <section className="panel-card panel-section">
        <h2 className="section-title">Lançamentos do mês</h2>

        <div className="panel-list compact-list">
          {entries.map((entry) => (
            <article key={entry.id} className="panel-entry compact-entry">
              <div className="compact-entry-row">
                <strong>{new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR")}</strong>
                <span>Receita {formatCurrency(Number(entry.gross))}</span>
              </div>

              <div className="compact-entry-row">
                <span>KM {Number(entry.km)}</span>
                <span>Comb. {formatCurrency(Number(entry.fuel_cost))}</span>
              </div>

              <div className="compact-entry-row">
                <span>Extras {formatCurrency(Number(entry.extras))}</span>
                <strong className="panel-entry-profit">
                  Lucro {formatCurrency(Number(entry.profit))}
                </strong>
              </div>

              <div className="compact-entry-actions">
                <form action={deletePanelEntryAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="month" value={monthRef} />
                  <SubmitButton
                    idleLabel="Excluir"
                    pendingLabel="Excluindo..."
                    className="panel-button-secondary"
                  />
                </form>
              </div>
            </article>
          ))}

          {entries.length === 0 ? (
            <p className="panel-empty">Nenhum lançamento encontrado para esse mês.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
