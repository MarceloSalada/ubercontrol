import { PanelHeader } from "@/components/panel/header";
import { savePanelCostsAction } from "@/app/panel/actions";
import { currentMonthRef, getMonthBundle, getPanelSession } from "@/lib/panel-data";
import { SubmitButton } from "@/components/ui/submit-button";

function inputValue(value?: number) {
  return value && value > 0 ? String(value) : "";
}

export default async function PanelCostsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { user } = await getPanelSession();
  const { monthlyCosts } = await getMonthBundle(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Custos mensais"
        subtitle="Concentre aqui os custos fixos do período para o dashboard ficar limpo."
        monthRef={monthRef}
      />
      {params?.error ? <div className="panel-info error">{params.error}</div> : null}
      {params?.success ? <div className="panel-info success">{params.success}</div> : null}

      <section className="panel-card">
        <form action={savePanelCostsAction} className="panel-form two-col">
          <input type="hidden" name="month_ref" value={monthRef} />
          <label className="full">
            <span>Mês de referência</span>
            <input type="month" value={monthRef} readOnly />
          </label>
          <label><span>Financiamento</span><input type="text" name="financing" defaultValue={inputValue(monthlyCosts?.financing)} /></label>
          <label><span>Seguro</span><input type="text" name="insurance" defaultValue={inputValue(monthlyCosts?.insurance)} /></label>
          <label><span>IPVA</span><input type="text" name="ipva" defaultValue={inputValue(monthlyCosts?.ipva)} /></label>
          <label><span>Manutenção óleo</span><input type="text" name="oil_maintenance" defaultValue={inputValue(monthlyCosts?.oil_maintenance)} /></label>
          <label><span>Reserva manutenção</span><input type="text" name="reserve_maintenance" defaultValue={inputValue(monthlyCosts?.reserve_maintenance)} /></label>
          <label><span>Internet / celular</span><input type="text" name="cellphone" defaultValue={inputValue(monthlyCosts?.cellphone)} /></label>
          <label><span>Lavagem</span><input type="text" name="washing" defaultValue={inputValue(monthlyCosts?.washing)} /></label>
          <label><span>Outros</span><input type="text" name="other_monthly" defaultValue={inputValue(monthlyCosts?.other_monthly)} /></label>
          <div className="full">
            <SubmitButton
              idleLabel="Salvar custos"
              pendingLabel="Salvando..."
              className="panel-button"
            />
          </div>
        </form>
      </section>
    </>
  );
}
