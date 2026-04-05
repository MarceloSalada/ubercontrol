import { Banknote, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { PanelHeader } from "@/components/panel/header";
import { StatCard } from "@/components/panel/stat-card";
import { currentMonthRef, getMonthBundle, getPanelSession } from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";

export default async function PanelDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { userLabel, userEmail, user } = await getPanelSession();
  const { metrics } = await getMonthBundle(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Dashboard"
        subtitle={`Bem-vindo, ${userLabel}. Veja o fechamento do período.`}
        monthRef={monthRef}
      />

      <section className="panel-stat-grid">
        <StatCard
          label="Receita do mês"
          value={formatCurrency(metrics.gross)}
          icon={TrendingUp}
        />
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
          <span>Conta</span>
          <strong>{userEmail}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Dias lançados</span>
          <strong>{metrics.workedDays}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Média líquida/dia</span>
          <strong>{formatCurrency(metrics.average)}</strong>
        </div>
      </section>
    </>
  );
}
