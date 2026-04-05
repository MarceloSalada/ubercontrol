import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const features = [
  "Controle de ganhos e custos por mês",
  "Lançamentos diários simples e rápidos",
  "Dashboard com visão clara do resultado",
  "Custos mensais separados do operacional",
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogged = !!user;

  return (
    <main className="page-shell">
      <div className="container grid">
        <section className="card hero hero-commercial">
          <div className="hero-brand">
            <div className="hero-brand-icon">
              <div className="hero-shield" />
              <div className="hero-line hero-line-1" />
              <div className="hero-line hero-line-2" />
              <div className="hero-line hero-line-3" />
              <div className="hero-arrow" />
            </div>

            <div>
              <h1>UberControl</h1>
              <p className="hero-subtitle">controle financeiro para motoristas</p>
            </div>
          </div>

          <div className="hero-copy">
            <p>
              Organize ganhos, custos e resultado do mês em um painel simples,
              visual e pronto para uso no celular.
            </p>

            <div className="cta-row">
              {isLogged ? (
                <Link href="/panel/dashboard" className="primary-btn">
                  Abrir painel
                </Link>
              ) : (
                <>
                  <Link href="/login" className="primary-btn">
                    Entrar
                  </Link>

                  <Link href="/signup" className="secondary-btn">
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="card hero-feature-card">
            <h2 className="section-title">O que você acompanha</h2>
            <ul className="list">
              {features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
