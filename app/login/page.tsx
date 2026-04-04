import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <h1 className="section-title">Entrar</h1>
        <p className="muted">
          Tela base para autenticação com Supabase. No próximo passo, vamos ligar este formulário ao banco.
        </p>

        <form className="form-grid">
          <label className="field">
            <span>E-mail</span>
            <input className="input" type="email" placeholder="voce@email.com" />
          </label>

          <label className="field">
            <span>Senha</span>
            <input className="input" type="password" placeholder="********" />
          </label>

          <button type="submit" className="primary-btn">
            Entrar
          </button>
        </form>

        <p className="small muted">
          Ainda não tem conta? <Link href="/signup">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
