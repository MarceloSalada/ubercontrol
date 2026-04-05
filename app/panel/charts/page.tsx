import {
  CalendarDays,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ChartsView } from "@/components/panel/charts-view";
import { PanelHeader } from "@/components/panel/header";
import { StatCard } from "@/components/panel/stat-card";
import { currentMonthRef, getMonthBundle, getPanelSession } from "@/lib/panel-data";
import { formatCurrency } from "@/lib/utils/format";

export default async function PanelChartsPage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const { user } = await getPanelSession();
  const { metrics, reserveHistory } = await getMonthBundle(user.id, monthRef);

  const bars = [
    { name: "Receita", value: metrics.gross },
    { name: "Variáveis", value: metrics.variable },
    { name: "Fixos", value: metrics.fixed },
    { name: "Lucro", value: metrics.net },
    { name: "Reserva", value: metrics.reserveBalance },
  ];

  const pie = [
    { name: "Variáveis", value: metrics.variable },
    { name: "Fixos", value: metrics.fixed },
    { name: "Reserva", value: Math.max(metrics.reserveBalance, 0) },
    { name: "Lucro", value: Math.max(metrics.net, 0) },
  ].filter((item) => item.value > 0);

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
        subtitle="Página dedicada para leitura rápida do fechamento mensal."
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

      <ChartsView bars={bars} pie={pie} history={history} />
    </>
  );
        }
