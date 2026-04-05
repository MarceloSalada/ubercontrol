"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthRefFromDate } from "@/lib/utils/format";
import {
  getFormString,
  parseDateInput,
  parseMoneyInput,
  parseMonthRef,
} from "@/lib/security/validation";

function redirectWithError(path: string, message: string) {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

function revalidatePanel(monthRef: string) {
  revalidatePath("/panel/dashboard");
  revalidatePath("/panel/entries");
  revalidatePath("/panel/costs");
  revalidatePath("/panel/charts");
  revalidatePath("/panel/admin");
  if (monthRef) revalidatePath(`/panel/dashboard?month=${monthRef}`);
}

export async function createPanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const date = parseDateInput(getFormString(formData, "date", 10));
    const gross = parseMoneyInput(formData.get("gross"), { min: 0.01, max: 100000 });
    const km = parseMoneyInput(formData.get("km"), { min: 0.01, max: 5000 });
    const fuelPrice = parseMoneyInput(formData.get("fuel_price"), { min: 0.01, max: 100 });
    const consumption = parseMoneyInput(formData.get("consumption"), { min: 0.01, max: 100 });
    const extras = parseMoneyInput(formData.get("extras") ?? "0", { min: 0, max: 50000 });

    const monthRef = monthRefFromDate(date);
    const fuelCost = (km / consumption) * fuelPrice;
    const totalCost = fuelCost + extras;
    const profit = gross - totalCost;

    const { error } = await db.from("daily_entries").insert({
      user_id: user.id,
      date,
      gross,
      km,
      fuel_price: fuelPrice,
      consumption,
      extras,
      fuel_cost: Number(fuelCost.toFixed(2)),
      total_cost: Number(totalCost.toFixed(2)),
      profit: Number(profit.toFixed(2)),
    });

    if (error) {
      redirectWithError(`/panel/entries?month=${monthRef}`, "Não foi possível salvar o lançamento.");
    }

    revalidatePanel(monthRef);
    redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20salvo`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/entries", message);
  }
}

export async function updatePanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const id = getFormString(formData, "id", 80);
    const date = parseDateInput(getFormString(formData, "date", 10));
    const gross = parseMoneyInput(formData.get("gross"), { min: 0.01, max: 100000 });
    const km = parseMoneyInput(formData.get("km"), { min: 0.01, max: 5000 });
    const fuelPrice = parseMoneyInput(formData.get("fuel_price"), { min: 0.01, max: 100 });
    const consumption = parseMoneyInput(formData.get("consumption"), { min: 0.01, max: 100 });
    const extras = parseMoneyInput(formData.get("extras") ?? "0", { min: 0, max: 50000 });

    if (!id) {
      redirectWithError("/panel/entries", "Lançamento inválido.");
    }

    const monthRef = monthRefFromDate(date);
    const fuelCost = (km / consumption) * fuelPrice;
    const totalCost = fuelCost + extras;
    const profit = gross - totalCost;

    const { error } = await db
      .from("daily_entries")
      .update({
        date,
        gross,
        km,
        fuel_price: fuelPrice,
        consumption,
        extras,
        fuel_cost: Number(fuelCost.toFixed(2)),
        total_cost: Number(totalCost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      redirectWithError(`/panel/entries/${id}`, "Não foi possível atualizar o lançamento.");
    }

    revalidatePanel(monthRef);
    redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20atualizado`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/entries", message);
  }
}

export async function deletePanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = getFormString(formData, "id", 80);
  const monthRef = getFormString(formData, "month", 7);

  if (!id) {
    redirectWithError("/panel/entries", "Lançamento inválido.");
  }

  const { error } = await db
    .from("daily_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(`/panel/entries?month=${monthRef}`, "Não foi possível remover o lançamento.");
  }

  revalidatePanel(monthRef);
  redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20removido`);
}

export async function savePanelCostsAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const monthRef = parseMonthRef(getFormString(formData, "month_ref", 7));

    const payload = {
      user_id: user.id,
      month_ref: monthRef,
      financing: parseMoneyInput(formData.get("financing") ?? "0", { min: 0, max: 100000 }),
      insurance: parseMoneyInput(formData.get("insurance") ?? "0", { min: 0, max: 100000 }),
      ipva: parseMoneyInput(formData.get("ipva") ?? "0", { min: 0, max: 100000 }),
      oil_maintenance: parseMoneyInput(formData.get("oil_maintenance") ?? "0", { min: 0, max: 100000 }),
      reserve_maintenance: parseMoneyInput(formData.get("reserve_maintenance") ?? "0", { min: 0, max: 100000 }),
      cellphone: parseMoneyInput(formData.get("cellphone") ?? "0", { min: 0, max: 100000 }),
      washing: parseMoneyInput(formData.get("washing") ?? "0", { min: 0, max: 100000 }),
      other_monthly: parseMoneyInput(formData.get("other_monthly") ?? "0", { min: 0, max: 100000 }),
    };

    const { error } = await db
      .from("monthly_costs")
      .upsert(payload, { onConflict: "user_id,month_ref" });

    if (error) {
      redirectWithError(`/panel/costs?month=${monthRef}`, "Não foi possível salvar os custos.");
    }

    revalidatePanel(monthRef);
    redirect(`/panel/costs?month=${monthRef}&success=Custos%20salvos`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/costs", message);
  }
}
