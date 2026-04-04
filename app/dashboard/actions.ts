"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthRefFromDate, parseNumber } from "@/lib/utils/format";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createDailyEntryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const date = getString(formData, "date");
  const gross = parseNumber(formData.get("gross"));
  const km = parseNumber(formData.get("km"));
  const fuelPrice = parseNumber(formData.get("fuel_price"));
  const consumption = parseNumber(formData.get("consumption"));
  const extras = parseNumber(formData.get("extras"));

  if (!date || gross <= 0 || km <= 0 || fuelPrice <= 0 || consumption <= 0) {
    redirect("/dashboard?error=Preencha%20os%20campos%20obrigat%C3%B3rios%20da%20di%C3%A1ria");
  }

  const fuelCost = km > 0 && consumption > 0 ? (km / consumption) * fuelPrice : 0;
  const totalCost = fuelCost + extras;
  const profit = gross - totalCost;

  const { error } = await supabase.from("daily_entries").insert({
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
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?month=${monthRefFromDate(date)}&success=Di%C3%A1ria%20salva%20com%20sucesso`);
}

export async function saveMonthlyCostsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const monthRef = getString(formData, "month_ref");

  if (!monthRef) {
    redirect("/dashboard?error=Selecione%20um%20m%C3%AAs%20v%C3%A1lido");
  }

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

  const { error } = await supabase.from("monthly_costs").upsert(payload, {
    onConflict: "user_id,month_ref",
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?month=${monthRef}&success=Custos%20mensais%20salvos%20com%20sucesso`);
}

export async function deleteDailyEntryAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = getString(formData, "id");
  const month = getString(formData, "month");

  if (!id) {
    redirect("/dashboard?error=Lan%C3%A7amento%20inv%C3%A1lido");
  }

  const { error } = await supabase.from("daily_entries").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard?month=${month || ""}&success=Lan%C3%A7amento%20removido%20com%20sucesso`);
}
