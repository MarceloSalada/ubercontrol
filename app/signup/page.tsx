import Link from "next/link";
import { signupAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/ui/submit-button";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <h1 className="section-title">Criar conta</h1>
        <p className="muted">
          Cadastre-se para acessar seu painel e acompanhar seu resultado por mês.
        </p>

        <form action={signupAction} className="form-grid">
          <AuthMessage error={error} success={success} />

          <label className="field">
            <span>Nome</span>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Seu nome"
              required
            />
          </label>

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
              minLength={6}
              required
            />
          </label>

          <SubmitButton
            idleLabel="Criar conta"
            pendingLabel="Criando conta..."
            className="primary-btn"
          />
        </form>

        <p className="small muted">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
