import Link from "next/link";

export default function BlockedPage() {
  return (
    <main className="page-shell">
      <div className="container" style={{ maxWidth: 720 }}>
        <section className="card hero" style={{ display: "grid", gap: 16 }}>
          <div>
            <h1>Acesso não liberado</h1>
            <p>
              Sua conta existe, mas ainda não foi liberada para usar o painel.
              Entre em contato com o administrador para ativação.
            </p>
          </div>

          <div className="cta-row">
            <Link href="/login" className="primary-btn">
              Voltar para o login
            </Link>
            <Link href="/" className="secondary-btn">
              Ir para a página inicial
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
