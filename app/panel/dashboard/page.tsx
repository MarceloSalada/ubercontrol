import { Banknote, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { PanelHeader } from "@/components/panel/header";
import { StatCard } from "@/components/panel/stat-card";
import { currentMonthRef, getDashboardData, getPanelSession } from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { userLabel, user } = await getPanelSession();
  const { latestEntry, metrics } = await getDashboardData(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Dashboard"
        subtitle={`Bem-vindo, ${userLabel}. Veja o fechamento do período.`}
        monthRef={monthRef}
      />

      <section className="panel-stat-grid">
        <StatCard label="Receita do mês" value={formatCurrency(metrics.gross)} icon={TrendingUp} />
        <StatCard
          label="Custos totais"
          value={formatCurrency(metrics.variable + metrics.fixed)}
          icon={Wallet}
        />
        <StatCard
          label="Lucro líquido"
          value={formatCurrency(metrics.net)}
          icon={Banknote}
          tone={metrics.net < 0 ? "danger" : "default"}
        />
        <StatCard
          label="Reserva acumulada"
          value={formatCurrency(metrics.reserveBalance)}
          icon={PiggyBank}
        />
      </section>

      <section className="panel-card panel-kv compact">
        <div className="panel-kv-row">
          <span>Dias lançados</span>
          <strong>{metrics.workedDays}</strong>
        </div>
      </section>

      <section className="panel-card panel-section">
        <div className="panel-header-top">
          <div>
            <h2 className="section-title">Última diária</h2>
          </div>
        </div>

        {latestEntry ? (
          <div className="panel-kv compact">
            <div className="panel-kv-row">
              <span>Receita do dia</span>
              <strong>{formatCurrency(Number(latestEntry.gross))}</strong>
            </div>
            <div className="panel-kv-row">
              <span>KM rodado</span>
              <strong>{Number(latestEntry.km)}</strong>
            </div>
            <div className="panel-kv-row">
              <span>Combustível gasto</span>
              <strong>{formatCurrency(Number(latestEntry.fuel_cost))}</strong>
            </div>
            <div className="panel-kv-row">
              <span>Lucro do dia</span>
              <strong>{formatCurrency(Number(latestEntry.profit))}</strong>
            </div>
          </div>
        ) : (
          <p className="panel-empty">Ainda não há lançamentos neste mês.</p>
        )}
      </section>
    </>
  );
}
