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

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.includes("NEXT_REDIRECT")
  );
}

function redirectWithError(path: string, message: string) {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

function revalidatePanel(monthRef: string) {
  revalidatePath("/panel/dashboard");
  revalidatePath("/panel/entries");
  revalidatePath("/panel/costs");
  revalidatePath("/panel/charts");
  revalidatePath("/panel/admin");
  revalidatePath("/panel/reserve");
  if (monthRef) {
    revalidatePath(`/panel/dashboard?month=${monthRef}`);
    revalidatePath(`/panel/costs?month=${monthRef}`);
    revalidatePath(`/panel/charts?month=${monthRef}`);
    revalidatePath(`/panel/reserve?month=${monthRef}`);
  }
}

function monthStartDate(monthRef: string) {
  return `${monthRef}-01`;
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
    if (isRedirectError(error)) throw error;
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
    if (isRedirectError(error)) throw error;
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

    const depositAmount = Number(payload.reserve_maintenance || 0);

    const { data: existingDeposit } = await db
      .from("maintenance_reserve_movements")
      .select("id")
      .eq("user_id", user.id)
      .eq("month_ref", monthRef)
      .eq("movement_type", "deposit")
      .eq("description", "Aporte mensal planejado")
      .maybeSingle();

    if (existingDeposit?.id) {
      await db
        .from("maintenance_reserve_movements")
        .update({
          movement_date: monthStartDate(monthRef),
          amount: depositAmount,
        })
        .eq("id", existingDeposit.id)
        .eq("user_id", user.id);
    } else {
      await db.from("maintenance_reserve_movements").insert({
        user_id: user.id,
        movement_date: monthStartDate(monthRef),
        month_ref: monthRef,
        movement_type: "deposit",
        amount: depositAmount,
        description: "Aporte mensal planejado",
      });
    }

    revalidatePanel(monthRef);
    redirect(`/panel/costs?month=${monthRef}&success=Custos%20salvos`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/costs", message);
  }
}

export async function createReserveMovementAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const movementDate = parseDateInput(getFormString(formData, "movement_date", 10));
    const monthRef = parseMonthRef(getFormString(formData, "month_ref", 7));
    const movementType = getFormString(formData, "movement_type", 20) as
      | "expense"
      | "adjustment";
    const amount = parseMoneyInput(formData.get("amount"), { min: 0.01, max: 100000 });
    const description = getFormString(formData, "description", 180);

    if (!["expense", "adjustment"].includes(movementType)) {
      redirectWithError(`/panel/reserve?month=${monthRef}`, "Tipo de movimento inválido.");
    }

    const { error } = await db.from("maintenance_reserve_movements").insert({
      user_id: user.id,
      movement_date: movementDate,
      month_ref: monthRef,
      movement_type: movementType,
      amount,
      description: description || null,
    });

    if (error) {
      redirectWithError(`/panel/reserve?month=${monthRef}`, "Não foi possível salvar o movimento.");
    }

    revalidatePanel(monthRef);
    redirect(`/panel/reserve?month=${monthRef}&success=Movimento%20salvo`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/reserve", message);
  }
}

export async function updateReserveMovementAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const id = getFormString(formData, "id", 80);
    const movementDate = parseDateInput(getFormString(formData, "movement_date", 10));
    const monthRef = parseMonthRef(getFormString(formData, "month_ref", 7));
    const movementType = getFormString(formData, "movement_type", 20) as
      | "deposit"
      | "expense"
      | "adjustment";
    const amount = parseMoneyInput(formData.get("amount"), { min: 0.01, max: 100000 });
    const description = getFormString(formData, "description", 180);

    if (!id) {
      redirectWithError("/panel/reserve", "Movimento inválido.");
    }

    if (!["deposit", "expense", "adjustment"].includes(movementType)) {
      redirectWithError(`/panel/reserve/${id}`, "Tipo de movimento inválido.");
    }

    const { error } = await db
      .from("maintenance_reserve_movements")
      .update({
        movement_date: movementDate,
        month_ref: monthRef,
        movement_type: movementType,
        amount,
        description: description || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      redirectWithError(`/panel/reserve/${id}`, "Não foi possível atualizar o movimento.");
    }

    revalidatePanel(monthRef);
    redirect(`/panel/reserve?month=${monthRef}&success=Movimento%20atualizado`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Dados inválidos.";
    redirectWithError("/panel/reserve", message);
  }
}

export async function deleteReserveMovementAction(formData: FormData) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const id = getFormString(formData, "id", 80);
  const monthRef = getFormString(formData, "month_ref", 7);

  if (!id) {
    redirectWithError("/panel/reserve", "Movimento inválido.");
  }

  const { error } = await db
    .from("maintenance_reserve_movements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(`/panel/reserve?month=${monthRef}`, "Não foi possível remover o movimento.");
  }

  revalidatePanel(monthRef);
  redirect(`/panel/reserve?month=${monthRef}&success=Movimento%20removido`);
}
