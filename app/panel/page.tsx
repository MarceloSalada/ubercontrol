import { PanelHeader } from "@/components/panel/header";
import { createPanelEntryAction } from "@/app/panel/actions";
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

        {entries.length > 0 ? (
          <div className="entries-table-wrap">
            <div className="entries-table">
              <div className="entries-row entries-head">
                <span>Data</span>
                <span>Receita</span>
                <span>KM</span>
                <span>Comb.</span>
                <span>Lucro</span>
              </div>

              {entries.map((entry) => (
                <div key={entry.id} className="entries-row">
                  <span>{new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
                  <span>{formatCurrency(Number(entry.gross))}</span>
                  <span>{Number(entry.km)}</span>
                  <span>{formatCurrency(Number(entry.fuel_cost))}</span>
                  <strong>{formatCurrency(Number(entry.profit))}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="panel-empty">Nenhum lançamento encontrado para esse mês.</p>
        )}
      </section>
    </>
  );
                  }
