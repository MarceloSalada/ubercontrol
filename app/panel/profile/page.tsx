import { logoutAction } from "@/app/auth/actions";
import { PanelHeader } from "@/components/panel/header";
import { getPanelSession } from "@/lib/panel-data";

export default async function PanelProfilePage() {
  const { userLabel, userEmail } = await getPanelSession();

  return (
    <>
      <PanelHeader title="Perfil" subtitle="Área simples da conta para esta fase do produto." />
      <section className="panel-card panel-kv">
        <div className="panel-kv-row"><span>Nome</span><strong>{userLabel}</strong></div>
        <div className="panel-kv-row"><span>E-mail</span><strong>{userEmail}</strong></div>
        <div className="panel-kv-row"><span>Status</span><strong>Conta autenticada</strong></div>
      </section>
      <section className="panel-card panel-section">
        <h2 className="section-title">Conta</h2>
        <p className="muted">Nas próximas iterações, aqui entram alteração de nome, senha e preferências.</p>
        <form action={logoutAction}>
          <button className="panel-button" type="submit">Sair da conta</button>
        </form>
      </section>
    </>
  );
}
