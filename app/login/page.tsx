import Link from "next/link";
import { loginAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <h1 className="section-title">Entrar</h1>
        <p className="muted">
          Entre com seu e-mail e senha para acessar seus lançamentos e dashboard.
        </p>

        <form action={loginAction} className="form-grid">
          <AuthMessage error={error} success={success} />

          <label className="field">
            <span>E-mail</span>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="voce@email.com"
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="********"
              required
            />
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
