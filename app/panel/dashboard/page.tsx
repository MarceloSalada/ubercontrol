import Link from "next/link";
import { ArrowRight, Banknote, Landmark, TrendingUp, Zap } from "lucide-react";
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
  const { metrics, entries } = await getMonthBundle(user.id, monthRef);

  return (
    <>
      <PanelHeader
        title="Dashboard"
        subtitle={`Bem-vindo, ${userLabel}. Veja o fechamento do período e seus principais números.`}
        monthRef={monthRef}
      />

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

      <section className="panel-stat-grid">
        <StatCard
          label="Receita do mês"
          value={formatCurrency(metrics.gross)}
          icon={TrendingUp}
        />
        <StatCard
          label="Custos variáveis"
          value={formatCurrency(metrics.variable)}
          icon={Zap}
        />
        <StatCard
          label="Custos fixos"
          value={formatCurrency(metrics.fixed)}
          icon={Landmark}
        />
        <StatCard
          label="Lucro líquido"
          value={formatCurrency(metrics.net)}
          icon={Banknote}
          tone={metrics.net < 0 ? "danger" : "default"}
        />
      </section>

      <section className="panel-card panel-section">
        <div className="panel-header-top">
          <div>
            <h2 className="section-title">Últimos lançamentos</h2>
          </div>
          <Link href={`/panel/entries?month=${monthRef}`} className="panel-link">
            Ver todos
          </Link>
        </div>

        <div className="panel-list">
          {entries.slice(0, 4).map((entry) => (
            <article key={entry.id} className="panel-entry">
              <div className="panel-entry-top">
                <div>
                  <strong>
                    {new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR")}
                  </strong>
                  <p>Receita {formatCurrency(Number(entry.gross))}</p>
                </div>

                <Link className="panel-link" href={`/panel/entries/${entry.id}`}>
                  Editar{" "}
                  <ArrowRight
                    size={14}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                </Link>
              </div>

              <small>
                Combustível {formatCurrency(Number(entry.fuel_cost))} • Extras{" "}
                {formatCurrency(Number(entry.extras))}
              </small>

              <div className="panel-entry-profit">
                Lucro {formatCurrency(Number(entry.profit))}
              </div>
            </article>
          ))}

          {entries.length === 0 ? (
            <p className="panel-empty">Ainda não há lançamentos neste mês.</p>
          ) : null}
        </div>
      </section>
    </>
  );
          }
