import { notFound } from "next/navigation";
import { PanelHeader } from "@/components/panel/header";
import { updateReserveMovementAction } from "@/app/panel/actions";
import { getPanelSession, getReserveMovementById } from "@/lib/panel-data";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function PanelReserveEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { user } = await getPanelSession();
  const movement = await getReserveMovementById(user.id, id);

  if (!movement) {
    notFound();
  }

  return (
    <>
      <PanelHeader
        title="Editar reserva"
        subtitle="Atualize o movimento da reserva de manutenção."
        monthRef={movement.month_ref}
      />

      {query?.error ? <div className="panel-info error">{query.error}</div> : null}

      <section className="panel-card">
        <form action={updateReserveMovementAction} className="panel-form two-col">
          <input type="hidden" name="id" value={movement.id} />

          <label>
            <span>Data</span>
            <input type="date" name="movement_date" defaultValue={movement.movement_date} required />
          </label>

          <label>
            <span>Mês de referência</span>
            <input type="month" name="month_ref" defaultValue={movement.month_ref} required />
          </label>

          <label>
            <span>Tipo</span>
            <select name="movement_type" defaultValue={movement.movement_type}>
              <option value="deposit">Aporte</option>
              <option value="expense">Gasto</option>
              <option value="adjustment">Ajuste</option>
            </select>
          </label>

          <label>
            <span>Valor</span>
            <input
              type="text"
              name="amount"
              defaultValue={String(movement.amount)}
              inputMode="decimal"
              required
            />
          </label>

          <label className="full">
            <span>Descrição</span>
            <input
              type="text"
              name="description"
              defaultValue={movement.description ?? ""}
              placeholder="Descrição"
            />
          </label>

          <div className="full">
            <SubmitButton
              idleLabel="Atualizar movimento"
              pendingLabel="Atualizando..."
              className="panel-button"
            />
          </div>
        </form>
      </section>
    </>
  );
}
