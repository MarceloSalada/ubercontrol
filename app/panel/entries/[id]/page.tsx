import Link from "next/link";
import { notFound } from "next/navigation";
import { PanelHeader } from "@/components/panel/header";
import { updatePanelEntryAction } from "@/app/panel/actions";
import { getPanelSession } from "@/lib/panel-data";

export default async function PanelEntryEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ error?: string }> }) {
  const route = await params;
  const q = await searchParams;
  const { db, user } = await getPanelSession();

  const { data: entry } = await db
    .from("daily_entries")
    .select("id,date,gross,km,fuel_price,consumption,extras")
    .eq("id", route.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) notFound();

  return (
    <>
      <PanelHeader title="Editar lançamento" subtitle="Atualize os dados da diária e salve novamente." monthRef={entry.date.slice(0, 7)} />
      {q?.error ? <div className="panel-info error">{q.error}</div> : null}
      <section className="panel-card">
        <form action={updatePanelEntryAction} className="panel-form two-col">
          <input type="hidden" name="id" value={entry.id} />
          <label><span>Data</span><input type="date" name="date" defaultValue={entry.date} required /></label>
          <label><span>Ganho bruto</span><input type="text" name="gross" defaultValue={entry.gross} required /></label>
          <label><span>KM rodado</span><input type="text" name="km" defaultValue={entry.km} required /></label>
          <label><span>Preço combustível</span><input type="text" name="fuel_price" defaultValue={entry.fuel_price} required /></label>
          <label><span>Consumo (km/L)</span><input type="text" name="consumption" defaultValue={entry.consumption} required /></label>
          <label><span>Extras</span><input type="text" name="extras" defaultValue={entry.extras} /></label>
          <div className="full panel-inline">
            <button className="panel-button" type="submit">Salvar alterações</button>
            <Link className="panel-button-secondary" href={`/panel/entries?month=${entry.date.slice(0, 7)}`}>Voltar</Link>
          </div>
        </form>
      </section>
    </>
  );
}
