"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFormString } from "@/lib/security/validation";
import { isAdminEmail } from "@/lib/security/admin";

function fail(message: string) {
  redirect(`/panel/admin?error=${encodeURIComponent(message)}`);
}

export async function saveAuthorizedUserAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) fail("Acesso administrativo não autorizado.");

  const email = getFormString(formData, "email", 120).toLowerCase();
  const plan = getFormString(formData, "plan", 40);
  const notes = getFormString(formData, "notes", 300);
  const isActive = getFormString(formData, "is_active", 10) === "true";

  if (!email || !email.includes("@")) {
    fail("Informe um e-mail válido.");
  }

  const { error } = await db.from("authorized_users").upsert(
    {
      email,
      is_active: isActive,
      plan: plan || null,
      notes: notes || null,
    },
    { onConflict: "email" }
  );

  if (error) {
    fail("Não foi possível salvar o usuário autorizado.");
  }

  revalidatePath("/panel/admin");
  redirect(`/panel/admin?success=${encodeURIComponent("Usuário autorizado salvo com sucesso.")}`);
}
