"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthRefFromDate, parseNumber } from "@/lib/utils/format";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidatePanel(monthRef: string) {
  revalidatePath("/panel/dashboard");
  revalidatePath("/panel/entries");
  revalidatePath("/panel/costs");
  revalidatePath("/panel/charts");
  if (monthRef) revalidatePath(`/panel/dashboard?month=${monthRef}`);
}

export async function createPanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const date = getString(formData, "date");
  const gross = parseNumber(formData.get("gross"));
  const km = parseNumber(formData.get("km"));
  const fuelPrice = parseNumber(formData.get("fuel_price"));
  const consumption = parseNumber(formData.get("consumption"));
  const extras = parseNumber(formData.get("extras"));
  const monthRef = monthRefFromDate(date);

  if (!date || gross <= 0 || km <= 0 || fuelPrice <= 0 || consumption <= 0) {
    redirect(`/panel/entries?month=${monthRef}&error=Preencha%20os%20campos%20obrigat%C3%B3rios`);
  }

  const fuelCost = km > 0 && consumption > 0 ? (km / consumption) * fuelPrice : 0;
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

  if (error) redirect(`/panel/entries?month=${monthRef}&error=${encodeURIComponent(error.message)}`);
  revalidatePanel(monthRef);
  redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20salvo`);
}

export async function updatePanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = getString(formData, "id");
  const date = getString(formData, "date");
  const gross = parseNumber(formData.get("gross"));
  const km = parseNumber(formData.get("km"));
  const fuelPrice = parseNumber(formData.get("fuel_price"));
  const consumption = parseNumber(formData.get("consumption"));
  const extras = parseNumber(formData.get("extras"));
  const monthRef = monthRefFromDate(date);

  const fuelCost = km > 0 && consumption > 0 ? (km / consumption) * fuelPrice : 0;
  const totalCost = fuelCost + extras;
  const profit = gross - totalCost;

  const { error } = await db.from("daily_entries").update({
    date,
    gross,
    km,
    fuel_price: fuelPrice,
    consumption,
    extras,
    fuel_cost: Number(fuelCost.toFixed(2)),
    total_cost: Number(totalCost.toFixed(2)),
    profit: Number(profit.toFixed(2)),
  }).eq("id", id).eq("user_id", user.id);

  if (error) redirect(`/panel/entries/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePanel(monthRef);
  redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20atualizado`);
}

export async function deletePanelEntryAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = getString(formData, "id");
  const monthRef = getString(formData, "month");
  const { error } = await db.from("daily_entries").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/panel/entries?month=${monthRef}&error=${encodeURIComponent(error.message)}`);
  revalidatePanel(monthRef);
  redirect(`/panel/entries?month=${monthRef}&success=Lan%C3%A7amento%20removido`);
}

export async function savePanelCostsAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const monthRef = getString(formData, "month_ref");
  const payload = {
    user_id: user.id,
    month_ref: monthRef,
    financing: parseNumber(formData.get("financing")),
    insurance: parseNumber(formData.get("insurance")),
    ipva: parseNumber(formData.get("ipva")),
    oil_maintenance: parseNumber(formData.get("oil_maintenance")),
    reserve_maintenance: parseNumber(formData.get("reserve_maintenance")),
    cellphone: parseNumber(formData.get("cellphone")),
    washing: parseNumber(formData.get("washing")),
    other_monthly: parseNumber(formData.get("other_monthly")),
  };

  const { error } = await db.from("monthly_costs").upsert(payload, { onConflict: "user_id,month_ref" });
  if (error) redirect(`/panel/costs?month=${monthRef}&error=${encodeURIComponent(error.message)}`);
  revalidatePanel(monthRef);
  redirect(`/panel/costs?month=${monthRef}&success=Custos%20salvos`);
}
