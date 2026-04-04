import { logoutAction } from "@/app/auth/actions";
import { PanelHeader } from "@/components/panel/header";
import { getPanelSession } from "@/lib/panel-data";

export default async function PanelProfilePage() {
  const { userLabel, userEmail } = await getPanelSession();

  return (
    <>
      <PanelHeader title="Perfil" subtitle="" />

      <section className="panel-card panel-kv compact">
        <div className="panel-kv-row">
          <span>Nome</span>
          <strong>{userLabel}</strong>
        </div>
        <div className="panel-kv-row">
          <span>E-mail</span>
          <strong>{userEmail}</strong>
        </div>
        <div className="panel-kv-row">
          <span>Status</span>
          <strong>Conta autenticada</strong>
        </div>
      </section>

      <section className="panel-card panel-section compact">
        <form action={logoutAction}>
          <button className="panel-button" type="submit">
            Sair da conta
          </button>
        </form>
      </section>
    </>
  );
}
