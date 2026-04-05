import { CalendarDays, Landmark, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { ChartsView } from "@/components/panel/charts-view";
import { PanelHeader } from "@/components/panel/header";
import { StatCard } from "@/components/panel/stat-card";
import {
  currentMonthRef,
  getMonthBundle,
  getPanelSession,
  getReserveHistory,
} from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";

export default async function PanelChartsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { user } = await getPanelSession();
  const [{ metrics }, reserveHistory] = await Promise.all([
    getMonthBundle(user.id, monthRef),
    getReserveHistory(user.id, monthRef),
  ]);

  const history = reserveHistory.map((item) => ({
    label: item.label,
    lucro: item.net,
    reserva: item.reserveBalance,
    aportes: item.reserveDeposits,
    gastos: item.reserveExpenses,
  }));

  return (
    <>
      <PanelHeader
        title="Gráficos"
        subtitle="Leitura visual do mês."
        monthRef={monthRef}
      />

      <section className="panel-stat-grid">
        <StatCard label="Receita" value={formatCurrency(metrics.gross)} icon={TrendingUp} />
        <StatCard
          label="Custos totais"
          value={formatCurrency(metrics.variable + metrics.fixed)}
          icon={Wallet}
        />
        <StatCard label="Dias lançados" value={String(metrics.workedDays)} icon={CalendarDays} />
        <StatCard
          label="Lucro líquido"
          value={formatCurrency(metrics.net)}
          icon={Landmark}
          tone={metrics.net < 0 ? "danger" : "default"}
        />
        <StatCard
          label="Reserva acumulada"
          value={formatCurrency(metrics.reserveBalance)}
          icon={PiggyBank}
        />
      </section>

      <ChartsView history={history} />
    </>
  );
}
