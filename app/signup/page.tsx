import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <h1 className="section-title">Criar conta</h1>
        <p className="muted">
          Tela base de cadastro. Vamos conectar este fluxo ao Supabase Auth com armazenamento por usuário.
        </p>

        <form className="form-grid">
          <label className="field">
            <span>Nome</span>
            <input className="input" type="text" placeholder="Seu nome" />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input className="input" type="email" placeholder="voce@email.com" />
          </label>

          <label className="field">
            <span>Senha</span>
            <input className="input" type="password" placeholder="********" />
          </label>

          <button type="submit" className="primary-btn">
            Criar conta
          </button>
        </form>

        <p className="small muted">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
