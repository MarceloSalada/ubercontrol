import { DailyEntryForm } from "@/components/dashboard/daily-entry-form";
import { EntriesList } from "@/components/dashboard/entries-list";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { MonthlyCostsForm } from "@/components/dashboard/monthly-costs-form";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { formatCurrency } from "@/lib/utils/format";
import { logoutAction } from "@/app/auth/actions";

type DashboardScreenProps = {
  userLabel: string;
  userEmail: string;
  monthRef: string;
  defaultDate: string;
  error?: string;
  success?: string;
  metrics: {
    gross: number;
    variable: number;
    fixed: number;
    net: number;
    workedDays: number;
    average: number;
  };
  monthlyCosts: {
    financing?: number;
    insurance?: number;
    ipva?: number;
    oil_maintenance?: number;
    reserve_maintenance?: number;
    cellphone?: number;
    washing?: number;
    other_monthly?: number;
  } | null;
  entries: Array<{
    id: string;
    date: string;
    gross: number;
    km: number;
    fuel_cost: number;
    extras: number;
    profit: number;
  }>;
};

export function DashboardScreen({
  userLabel,
  userEmail,
  monthRef,
  defaultDate,
  error,
  success,
  metrics,
  monthlyCosts,
  entries,
}: DashboardScreenProps) {
  return (
    <main className="page-shell">
      <div className="container grid">
        <section className="card">
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 className="section-title">Dashboard</h1>
              <p className="muted">Área protegida com dados reais por mês e por usuário.</p>
              <p className="muted" style={{ marginTop: 8 }}>
                Usuário: <strong>{userLabel}</strong>
              </p>
              <p className="muted" style={{ marginTop: 4 }}>E-mail: {userEmail}</p>
            </div>

            <form action={logoutAction}>
              <button type="submit" className="secondary-btn">Sair</button>
            </form>
          </div>
        </section>

        <AuthMessage error={error} success={success} />

        <MonthSelector currentMonth={monthRef} />

        <section className="kpi-grid">
          <SummaryCard label="Receita do mês" value={formatCurrency(metrics.gross)} />
          <SummaryCard label="Custos variáveis" value={formatCurrency(metrics.variable)} />
          <SummaryCard label="Custos fixos" value={formatCurrency(metrics.fixed)} />
          <SummaryCard label="Lucro líquido" value={formatCurrency(metrics.net)} />
        </section>

        <section className="kpi-grid">
          <SummaryCard label="Dias lançados" value={String(metrics.workedDays)} />
          <SummaryCard label="Média líquida por dia" value={formatCurrency(metrics.average)} help="Lucro líquido do mês dividido pelos dias lançados." />
        </section>

        <section className="dashboard-grid">
          <DailyEntryForm defaultDate={defaultDate} />
          <MonthlyCostsForm monthRef={monthRef} initialValues={monthlyCosts} />
        </section>

        <EntriesList entries={entries} monthRef={monthRef} />
      </div>
    </main>
  );
}
