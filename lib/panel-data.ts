import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function currentMonthRef() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(monthRef: string) {
  const [year, month] = monthRef.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextDate = new Date(year, month, 1);
  const end = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-01`;
  return { start, end };
}

export async function getPanelSession() {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await db.from("profiles").select("name,email").eq("id", user.id).maybeSingle();

  return {
    supabase,
    db,
    user,
    userLabel: profile?.name || user.user_metadata?.name || user.email || "Usuário",
    userEmail: profile?.email || user.email || "",
  };
}

export async function getMonthBundle(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as any;
  const range = getMonthRange(monthRef);

  const { data: entriesData } = await db
    .from("daily_entries")
    .select("id,date,gross,km,fuel_price,consumption,extras,fuel_cost,total_cost,profit")
    .eq("user_id", userId)
    .gte("date", range.start)
    .lt("date", range.end)
    .order("date", { ascending: false });

  const { data: monthlyCostsData } = await db
    .from("monthly_costs")
    .select("id,financing,insurance,ipva,oil_maintenance,reserve_maintenance,cellphone,washing,other_monthly")
    .eq("user_id", userId)
    .eq("month_ref", monthRef)
    .maybeSingle();

  const entries = (entriesData ?? []) as Array<{
    id: string;
    date: string;
    gross: number;
    km: number;
    fuel_price: number;
    consumption: number;
    extras: number;
    fuel_cost: number;
    total_cost: number;
    profit: number;
  }>;

  const monthlyCosts = (monthlyCostsData ?? null) as
    | {
        id?: string;
        financing?: number;
        insurance?: number;
        ipva?: number;
        oil_maintenance?: number;
        reserve_maintenance?: number;
        cellphone?: number;
        washing?: number;
        other_monthly?: number;
      }
    | null;

  const gross = entries.reduce((acc, item) => acc + Number(item.gross || 0), 0);
  const variable = entries.reduce((acc, item) => acc + Number(item.fuel_cost || 0) + Number(item.extras || 0), 0);
  const fixed =
    Number(monthlyCosts?.financing || 0) +
    Number(monthlyCosts?.insurance || 0) +
    Number(monthlyCosts?.ipva || 0) +
    Number(monthlyCosts?.oil_maintenance || 0) +
    Number(monthlyCosts?.reserve_maintenance || 0) +
    Number(monthlyCosts?.cellphone || 0) +
    Number(monthlyCosts?.washing || 0) +
    Number(monthlyCosts?.other_monthly || 0);

  const net = gross - variable - fixed;
  const workedDays = entries.length;
  const average = workedDays > 0 ? net / workedDays : 0;

  return {
    entries,
    monthlyCosts,
    metrics: {
      gross,
      variable,
      fixed,
      net,
      workedDays,
      average,
    },
  };
}
