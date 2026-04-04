import Link from "next/link";

const features = [
  "Cadastro e login por e-mail",
  "Lançamentos diários por motorista",
  "Custos mensais separados por mês",
  "Dashboard com visão real do período",
  "Base pronta para integrar com Supabase",
];

const kpis = [
  { label: "Objetivo", value: "V2 comercial" },
  { label: "Stack", value: "Next + TS" },
  { label: "Banco", value: "Supabase" },
  { label: "Deploy", value: "Vercel" },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container grid">
        <section className="card hero">
          <div>
            <h1>UberControl</h1>
            <p>
              Nova base profissional do app de finanças para motoristas. Esta versão foi planejada para
              autenticação, banco de dados e crescimento comercial, sem gambiarra.
            </p>
            <div className="cta-row">
              <Link href="/login" className="primary-btn">
                Entrar
              </Link>
              <Link href="/signup" className="secondary-btn">
                Criar conta
              </Link>
              <Link href="/dashboard" className="secondary-btn">
                Ver dashboard base
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Escopo inicial</h2>
            <ul className="list">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="kpi-grid">
          {kpis.map((item) => (
            <article key={item.label} className="card kpi-card">
              <span className="muted">{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
