import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthorizedAccess } from "@/lib/security/access";

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

function endOfMonthDate(monthRef: string) {
  const [year, month] = monthRef.split("-").map(Number);
  const lastDay = new Date(year, month, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(
    lastDay.getDate()
  ).padStart(2, "0")}`;
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

  const email = user.email ?? user.user_metadata?.email ?? null;

  const { data: authorizedUser } = await db
    .from("authorized_users")
    .select("email,is_active,allowed_until")
    .eq("email", email)
    .maybeSingle();

  if (!isAuthorizedAccess(authorizedUser, email)) {
    redirect("/blocked");
  }

  const { data: profile } = await db
    .from("profiles")
    .select("name,email")
    .eq("id", user.id)
    .maybeSingle();

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
  const monthEnd = endOfMonthDate(monthRef);

  const { data: entriesData } = await db
    .from("daily_entries")
    .select("id,date,gross,km,fuel_price,consumption,extras,fuel_cost,total_cost,profit")
    .eq("user_id", userId)
    .gte("date", range.start)
    .lt("date", range.end)
    .order("date", { ascending: false });

  const { data: monthlyCostsData } = await db
    .from("monthly_costs")
    .select("id,financing,insurance,ipva,reserve_maintenance,cellphone,washing,other_monthly")
    .eq("user_id", userId)
    .eq("month_ref", monthRef)
    .maybeSingle();

  const { data: reserveMovementsData } = await db
    .from("maintenance_reserve_movements")
    .select("id,movement_date,month_ref,movement_type,amount,description")
    .eq("user_id", userId)
    .lte("movement_date", monthEnd)
    .order("movement_date", { ascending: true });

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
        reserve_maintenance?: number;
        cellphone?: number;
        washing?: number;
        other_monthly?: number;
      }
    | null;

  const reserveMovements = (reserveMovementsData ?? []) as Array<{
    id: string;
    movement_date: string;
    month_ref: string;
    movement_type: "deposit" | "expense" | "adjustment";
    amount: number;
    description?: string | null;
  }>;

  const gross = entries.reduce((acc, item) => acc + Number(item.gross || 0), 0);
  const variable = entries.reduce(
    (acc, item) => acc + Number(item.fuel_cost || 0) + Number(item.extras || 0),
    0
  );

  const fixed =
    Number(monthlyCosts?.financing || 0) +
    Number(monthlyCosts?.insurance || 0) +
    Number(monthlyCosts?.ipva || 0) +
    Number(monthlyCosts?.reserve_maintenance || 0) +
    Number(monthlyCosts?.cellphone || 0) +
    Number(monthlyCosts?.washing || 0) +
    Number(monthlyCosts?.other_monthly || 0);

  const net = gross - variable - fixed;
  const workedDays = entries.length;
  const average = workedDays > 0 ? net / workedDays : 0;

  const reserveDeposits = reserveMovements
    .filter((item) => item.movement_type === "deposit")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const reserveExpenses = reserveMovements
    .filter((item) => item.movement_type === "expense")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const reserveAdjustments = reserveMovements
    .filter((item) => item.movement_type === "adjustment")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const reserveBalance = reserveDeposits + reserveAdjustments - reserveExpenses;

  return {
    entries,
    monthlyCosts,
    reserveMovements,
    metrics: {
      gross,
      variable,
      fixed,
      net,
      workedDays,
      average,
      reserveDeposits,
      reserveExpenses,
      reserveAdjustments,
      reserveBalance,
    },
  };
}
