import Link from "next/link";
import { PanelHeader } from "@/components/panel/header";
import {
  createReserveMovementAction,
  deleteReserveMovementAction,
} from "@/app/panel/actions";
import { currentMonthRef, getMonthBundle, getPanelSession } from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function PanelReservePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { user } = await getPanelSession();
  const { metrics, reserveMovementsMonth } = await getMonthBundle(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Reserva de manutenção"
        subtitle="Controle os aportes, gastos e ajustes da sua reserva."
        monthRef={monthRef}
      />

      {params?.error ? <div className="panel-info error">{params.error}</div> : null}
      {params?.success ? <div className="panel-info success">{params.success}</div> : null}

      <section className="panel-card panel-kv compact">
        <div className="panel-kv-row">
          <span>Saldo acumulado</span>
          <strong>{formatCurrency(metrics.reserveBalance)}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Aportes no mês</span>
          <strong>{formatCurrency(metrics.reserveMonthDeposits)}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Gastos no mês</span>
          <strong>{formatCurrency(metrics.reserveMonthExpenses)}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Ajustes no mês</span>
          <strong>{formatCurrency(metrics.reserveMonthAdjustments)}</strong>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-title">Novo movimento</h2>

        <form action={createReserveMovementAction} className="panel-form two-col">
          <input type="hidden" name="month_ref" value={monthRef} />

          <label>
            <span>Data</span>
            <input type="date" name="movement_date" defaultValue={`${monthRef}-01`} required />
          </label>

          <label>
            <span>Tipo</span>
            <select name="movement_type" defaultValue="expense">
              <option value="expense">Gasto da reserva</option>
              <option value="adjustment">Ajuste manual</option>
            </select>
          </label>

          <label>
            <span>Valor</span>
            <input type="text" name="amount" inputMode="decimal" required />
          </label>

          <label className="full">
            <span>Descrição</span>
            <input
              type="text"
              name="description"
              placeholder="Ex.: troca de óleo, pneu, freio, ajuste manual"
            />
          </label>

          <div className="full">
            <SubmitButton
              idleLabel="Salvar movimento"
              pendingLabel="Salvando..."
              className="panel-button"
            />
          </div>
        </form>
      </section>

      <section className="panel-card panel-section">
        <div className="panel-header-top">
          <div>
            <h2 className="section-title">Movimentos do mês</h2>
          </div>
        </div>

        <div className="panel-list">
          {reserveMovementsMonth.map((item) => (
            <article key={item.id} className="panel-entry">
              <div className="panel-entry-top">
                <div>
                  <strong>{new Date(`${item.movement_date}T12:00:00`).toLocaleDateString("pt-BR")}</strong>
                  <p>
                    {item.movement_type === "deposit"
                      ? "Aporte"
                      : item.movement_type === "expense"
                      ? "Gasto"
                      : "Ajuste"}{" "}
                    • {formatCurrency(Number(item.amount))}
                  </p>
                </div>

                <div className="panel-inline">
                  <Link className="panel-button-secondary" href={`/panel/reserve/${item.id}`}>
                    Editar
                  </Link>

                  <form action={deleteReserveMovementAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="month_ref" value={monthRef} />
                    <SubmitButton
                      idleLabel="Excluir"
                      pendingLabel="Excluindo..."
                      className="panel-button-secondary"
                    />
                  </form>
                </div>
              </div>

              <small>{item.description || "Sem descrição"}</small>
            </article>
          ))}

          {reserveMovementsMonth.length === 0 ? (
            <p className="panel-empty">Nenhum movimento de reserva encontrado para esse mês.</p>
          ) : null}
        </div>
      </section>
    </>
  );
          }
