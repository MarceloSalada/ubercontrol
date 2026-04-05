import { redirect } from "next/navigation";
import { PanelHeader } from "@/components/panel/header";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/security/admin";
import { saveAuthorizedUserAction } from "@/app/panel/admin/actions";

export default async function PanelAdminPage({ searchParams }: { searchParams?: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/panel/dashboard");

  const { data: authorizedUsers } = await db
    .from("authorized_users")
    .select("email,is_active,plan,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <>
      <PanelHeader title="Admin" subtitle="Liberação manual de usuários autorizados." />
      {params?.error ? <div className="panel-info error">{params.error}</div> : null}
      {params?.success ? <div className="panel-info success">{params.success}</div> : null}

      <section className="panel-card">
        <h2 className="section-title">Liberar usuário</h2>
        <form action={saveAuthorizedUserAction} className="panel-form two-col">
          <label className="full"><span>E-mail</span><input type="email" name="email" placeholder="cliente@email.com" required /></label>
          <label><span>Status</span>
            <select name="is_active" defaultValue="true">
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
          <label><span>Plano</span><input type="text" name="plan" placeholder="manual" /></label>
          <label className="full"><span>Observações</span><textarea name="notes" placeholder="Observações internas" /></label>
          <div className="full"><button className="panel-button" type="submit">Salvar usuário autorizado</button></div>
        </form>
      </section>

      <section className="panel-card panel-section">
        <h2 className="section-title">Últimos usuários autorizados</h2>
        <div className="panel-list">
          {(authorizedUsers ?? []).map((item: any) => (
            <article key={item.email} className="panel-entry">
              <div className="panel-entry-top">
                <div>
                  <strong>{item.email}</strong>
                  <p>Plano: {item.plan || "manual"}</p>
                </div>
                <div className="panel-entry-profit">{item.is_active ? "Ativo" : "Inativo"}</div>
              </div>
              <small>{item.notes || "Sem observações"}</small>
            </article>
          ))}
          {(authorizedUsers ?? []).length === 0 ? <p className="panel-empty">Nenhum usuário autorizado cadastrado.</p> : null}
        </div>
      </section>
    </>
  );
}
