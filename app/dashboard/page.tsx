const cards = [
  { title: "Receita do mês", value: "R$ 0,00" },
  { title: "Custos variáveis", value: "R$ 0,00" },
  { title: "Custos fixos", value: "R$ 0,00" },
  { title: "Lucro líquido", value: "R$ 0,00" },
];

const nextSteps = [
  "Conectar autenticação com Supabase",
  "Criar tabelas e políticas por usuário",
  "Migrar lançamentos diários para o banco",
  "Filtrar dashboards por mês real",
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <div className="container grid">
        <section className="card">
          <h1 className="section-title">Dashboard</h1>
          <p className="muted">
            Estrutura inicial da área logada. Aqui entrarão os dados do usuário autenticado, puxados do banco.
          </p>
        </section>

        <section className="kpi-grid">
          {cards.map((card) => (
            <article key={card.title} className="card kpi-card">
              <span className="muted">{card.title}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="card">
            <h2 className="section-title">Visão da V2</h2>
            <p className="muted">
              A V2 vai separar corretamente os dados por período, por usuário e por tipo de custo, corrigindo a
              limitação da versão anterior em localStorage.
            </p>
          </article>

          <article className="card">
            <h2 className="section-title">Próximos passos</h2>
            <ul className="list">
              {nextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
