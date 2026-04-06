// app/panel/costs/page.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PanelHeader } from "@/components/panel/header";
import { savePanelCostsAction } from "@/app/panel/actions";
import { currentMonthRef, getMonthlyCostsData, getPanelSession } from "@/lib/panel-data";
import { SubmitButton } from "@/components/ui/submit-button";

function inputValue(value?: number) {
  return value && value > 0 ? String(value) : "";
}

function shiftMonth(monthRef: string, offset: number) {
  const [year, month] = monthRef.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthRef: string) {
  const [year, month] = monthRef.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default async function PanelCostsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const previousMonth = shiftMonth(monthRef, -1);
  const nextMonth = shiftMonth(monthRef, 1);

  const { user } = await getPanelSession();
  const monthlyCosts = await getMonthlyCostsData(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Custos mensais"
        subtitle="Concentre aqui os custos fixos e os aportes do período."
        monthRef={monthRef}
      />

      {params?.error ? <div className="panel-info error">{params.error}</div> : null}
      {params?.success ? <div className="panel-info success">{params.success}</div> : null}

      <section className="panel-card panel-section">
        <div className="panel-actions-row">
          <Link href={`/panel/costs?month=${previousMonth}`} className="panel-button-secondary">
            <ChevronLeft size={16} />
            <span style={{ marginLeft: 6 }}>Mês anterior</span>
          </Link>

          <Link href={`/panel/costs?month=${nextMonth}`} className="panel-button-secondary">
            <span style={{ marginRight: 6 }}>Próximo mês</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="panel-kv compact">
          <div className="panel-kv-row">
            <span>Mês de referência</span>
            <strong>{formatMonthLabel(monthRef)}</strong>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <form action={savePanelCostsAction} className="panel-form two-col">
          <input type="hidden" name="month_ref" value={monthRef} />

          <label>
            <span>Financiamento / aluguel</span>
            <input
              type="text"
              name="financing"
              defaultValue={inputValue(monthlyCosts?.financing)}
              placeholder="Valor mensal"
            />
          </label>

          <label>
            <span>Seguro (valor mensal)</span>
            <input
              type="text"
              name="insurance"
              defaultValue={inputValue(monthlyCosts?.insurance)}
              placeholder="Valor mensal"
            />
          </label>

          <label>
            <span>IPVA (valor mensal)</span>
            <input
              type="text"
              name="ipva"
              defaultValue={inputValue(monthlyCosts?.ipva)}
              placeholder="Valor mensal"
            />
          </label>

          <label>
            <span>Reserva manutenção</span>
            <input
              type="text"
              name="reserve_maintenance"
              defaultValue={inputValue(monthlyCosts?.reserve_maintenance)}
              placeholder="Aporte mensal para manutenção"
            />
          </label>

          <label>
            <span>Internet / celular</span>
            <input
              type="text"
              name="cellphone"
              defaultValue={inputValue(monthlyCosts?.cellphone)}
              placeholder="Valor mensal"
            />
          </label>

          <label>
            <span>Lavagem</span>
            <input
              type="text"
              name="washing"
              defaultValue={inputValue(monthlyCosts?.washing)}
              placeholder="Valor mensal"
            />
          </label>

          <label className="full">
            <span>Outros custos pessoais / domésticos</span>
            <input
              type="text"
              name="other_monthly"
              defaultValue={inputValue(monthlyCosts?.other_monthly)}
              placeholder="Ex.: aluguel, energia, água, internet da casa, custos pessoais"
            />
          </label>

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
