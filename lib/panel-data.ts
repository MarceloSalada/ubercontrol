import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthorizedAccess } from "@/lib/security/access";

type DbClient = any;

type EntryRecord = {
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
};

type MonthlyCostsRecord = {
  id?: string;
  month_ref?: string;
  financing?: number;
  insurance?: number;
  ipva?: number;
  reserve_maintenance?: number;
  cellphone?: number;
  washing?: number;
  other_monthly?: number;
};

type ReserveMovementRecord = {
  id: string;
  movement_date: string;
  month_ref: string;
  movement_type: "deposit" | "expense" | "adjustment";
  amount: number;
  description?: string | null;
};

type MonthMetrics = {
  gross: number;
  variable: number;
  fixed: number;
  net: number;
  workedDays: number;
  average: number;
  reserveDeposits: number;
  reserveExpenses: number;
  reserveAdjustments: number;
  reserveBalance: number;
  reserveMonthDeposits: number;
  reserveMonthExpenses: number;
  reserveMonthAdjustments: number;
};

type ReserveHistoryPoint = {
  monthRef: string;
  label: string;
  gross: number;
  variable: number;
  fixed: number;
  net: number;
  reserveDeposits: number;
  reserveExpenses: number;
  reserveAdjustments: number;
  reserveBalance: number;
};

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

function monthRefFromDateString(date: string) {
  return date.slice(0, 7);
}

function shiftMonthRef(monthRef: string, offset: number) {
  const [year, month] = monthRef.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthSequence(endMonthRef: string, count = 6) {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    months.push(shiftMonthRef(endMonthRef, -i));
  }
  return months;
}

function formatShortMonth(monthRef: string) {
  const [year, month] = monthRef.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

function sumMonthlyCosts(monthlyCosts: MonthlyCostsRecord | null) {
  return (
    Number(monthlyCosts?.financing || 0) +
    Number(monthlyCosts?.insurance || 0) +
    Number(monthlyCosts?.ipva || 0) +
    Number(monthlyCosts?.reserve_maintenance || 0) +
    Number(monthlyCosts?.cellphone || 0) +
    Number(monthlyCosts?.washing || 0) +
    Number(monthlyCosts?.other_monthly || 0)
  );
}

function buildMonthMetrics(
  entries: EntryRecord[],
  monthlyCosts: MonthlyCostsRecord | null,
  reserveMovements: ReserveMovementRecord[],
  monthRef: string
): MonthMetrics {
  const reserveMovementsMonth = reserveMovements.filter((item) => item.month_ref === monthRef);

  const gross = entries.reduce((acc, item) => acc + Number(item.gross || 0), 0);
  const variable = entries.reduce(
    (acc, item) => acc + Number(item.fuel_cost || 0) + Number(item.extras || 0),
    0
  );
  const fixed = sumMonthlyCosts(monthlyCosts);
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

  const reserveMonthDeposits = reserveMovementsMonth
    .filter((item) => item.movement_type === "deposit")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const reserveMonthExpenses = reserveMovementsMonth
    .filter((item) => item.movement_type === "expense")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const reserveMonthAdjustments = reserveMovementsMonth
    .filter((item) => item.movement_type === "adjustment")
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  return {
    gross,
    variable,
    fixed,
    net,
    workedDays,
    average,
    reserveDeposits,
    reserveExpenses,
    reserveAdjustments,
    reserveBalance: reserveDeposits + reserveAdjustments - reserveExpenses,
    reserveMonthDeposits,
    reserveMonthExpenses,
    reserveMonthAdjustments,
  };
}

async function fetchEntriesByMonth(db: DbClient, userId: string, monthRef: string) {
  const range = getMonthRange(monthRef);

  const { data } = await db
    .from("daily_entries")
    .select("id,date,gross,km,fuel_price,consumption,extras,fuel_cost,total_cost,profit")
    .eq("user_id", userId)
    .gte("date", range.start)
    .lt("date", range.end)
    .order("date", { ascending: false });

  return (data ?? []) as EntryRecord[];
}

async function fetchMonthlyCostsByMonth(db: DbClient, userId: string, monthRef: string) {
  const { data } = await db
    .from("monthly_costs")
    .select("id,month_ref,financing,insurance,ipva,reserve_maintenance,cellphone,washing,other_monthly")
    .eq("user_id", userId)
    .eq("month_ref", monthRef)
    .maybeSingle();

  return (data ?? null) as MonthlyCostsRecord | null;
}

async function fetchReserveMovementsUntilMonthEnd(db: DbClient, userId: string, monthRef: string) {
  const monthEnd = endOfMonthDate(monthRef);

  const { data } = await db
    .from("maintenance_reserve_movements")
    .select("id,movement_date,month_ref,movement_type,amount,description")
    .eq("user_id", userId)
    .lte("movement_date", monthEnd)
    .order("movement_date", { ascending: true });

  return (data ?? []) as ReserveMovementRecord[];
}

async function buildReserveHistory(
  db: DbClient,
  userId: string,
  monthRef: string,
  reserveMovements: ReserveMovementRecord[]
) {
  const historyMonths = buildMonthSequence(monthRef, 6);
  const historyStart = getMonthRange(historyMonths[0]).start;
  const monthEnd = endOfMonthDate(monthRef);

  const [{ data: historyEntriesData }, { data: historyMonthlyCostsData }] = await Promise.all([
    db
      .from("daily_entries")
      .select("date,gross,fuel_cost,extras")
      .eq("user_id", userId)
      .gte("date", historyStart)
      .lte("date", monthEnd),
    db
      .from("monthly_costs")
      .select("month_ref,financing,insurance,ipva,reserve_maintenance,cellphone,washing,other_monthly")
      .eq("user_id", userId)
      .gte("month_ref", historyMonths[0])
      .lte("month_ref", monthRef),
  ]);

  const historyMap = new Map<string, ReserveHistoryPoint>();

  historyMonths.forEach((item) => {
    historyMap.set(item, {
      monthRef: item,
      label: formatShortMonth(item),
      gross: 0,
      variable: 0,
      fixed: 0,
      net: 0,
      reserveDeposits: 0,
      reserveExpenses: 0,
      reserveAdjustments: 0,
      reserveBalance: 0,
    });
  });

  const historyEntries = (historyEntriesData ?? []) as Array<{
    date: string;
    gross: number;
    fuel_cost: number;
    extras: number;
  }>;

  historyEntries.forEach((item) => {
    const ref = monthRefFromDateString(item.date);
    const bucket = historyMap.get(ref);
    if (!bucket) return;

    bucket.gross += Number(item.gross || 0);
    bucket.variable += Number(item.fuel_cost || 0) + Number(item.extras || 0);
  });

  const historyMonthlyCosts = (historyMonthlyCostsData ?? []) as Array<{
    month_ref: string;
    financing?: number;
    insurance?: number;
    ipva?: number;
    reserve_maintenance?: number;
    cellphone?: number;
    washing?: number;
    other_monthly?: number;
  }>;

  historyMonthlyCosts.forEach((item) => {
    const bucket = historyMap.get(item.month_ref);
    if (!bucket) return;

    bucket.fixed =
      Number(item.financing || 0) +
      Number(item.insurance || 0) +
      Number(item.ipva || 0) +
      Number(item.reserve_maintenance || 0) +
      Number(item.cellphone || 0) +
      Number(item.washing || 0) +
      Number(item.other_monthly || 0);
  });

  const openingReserveBalance = reserveMovements
    .filter((item) => item.movement_date < historyStart)
    .reduce((acc, item) => {
      if (item.movement_type === "deposit") return acc + Number(item.amount || 0);
      if (item.movement_type === "expense") return acc - Number(item.amount || 0);
      return acc + Number(item.amount || 0);
    }, 0);

  reserveMovements.forEach((item) => {
    const bucket = historyMap.get(item.month_ref);
    if (!bucket) return;

    if (item.movement_type === "deposit") {
      bucket.reserveDeposits += Number(item.amount || 0);
    } else if (item.movement_type === "expense") {
      bucket.reserveExpenses += Number(item.amount || 0);
    } else {
      bucket.reserveAdjustments += Number(item.amount || 0);
    }
  });

  let runningReserve = openingReserveBalance;

  return historyMonths.map((item) => {
    const bucket = historyMap.get(item)!;
    bucket.net = bucket.gross - bucket.variable - bucket.fixed;
    runningReserve =
      runningReserve +
      bucket.reserveDeposits +
      bucket.reserveAdjustments -
      bucket.reserveExpenses;
    bucket.reserveBalance = runningReserve;

    return {
      monthRef: bucket.monthRef,
      label: bucket.label,
      gross: Number(bucket.gross.toFixed(2)),
      variable: Number(bucket.variable.toFixed(2)),
      fixed: Number(bucket.fixed.toFixed(2)),
      net: Number(bucket.net.toFixed(2)),
      reserveDeposits: Number(bucket.reserveDeposits.toFixed(2)),
      reserveExpenses: Number(bucket.reserveExpenses.toFixed(2)),
      reserveAdjustments: Number(bucket.reserveAdjustments.toFixed(2)),
      reserveBalance: Number(bucket.reserveBalance.toFixed(2)),
    };
  });
}

export const getPanelSession = cache(async () => {
  const supabase = await createClient();
  const db = supabase as DbClient;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? user.user_metadata?.email ?? null;

  const [{ data: authorizedUser }, { data: profile }] = await Promise.all([
    db
      .from("authorized_users")
      .select("email,is_active,allowed_until")
      .eq("email", email)
      .maybeSingle(),
    db.from("profiles").select("name,email").eq("id", user.id).maybeSingle(),
  ]);

  if (!isAuthorizedAccess(authorizedUser, email)) {
    redirect("/blocked");
  }

  return {
    supabase,
    db,
    user,
    userLabel: profile?.name || user.user_metadata?.name || user.email || "Usuário",
    userEmail: profile?.email || user.email || "",
  };
});

export async function getEntriesData(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  return fetchEntriesByMonth(db, userId, monthRef);
}

export async function getMonthlyCostsData(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  return fetchMonthlyCostsByMonth(db, userId, monthRef);
}

export async function getDashboardData(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  const [entries, monthlyCosts, reserveMovements] = await Promise.all([
    fetchEntriesByMonth(db, userId, monthRef),
    fetchMonthlyCostsByMonth(db, userId, monthRef),
    fetchReserveMovementsUntilMonthEnd(db, userId, monthRef),
  ]);

  return {
    entries,
    latestEntry: entries[0] ?? null,
    metrics: buildMonthMetrics(entries, monthlyCosts, reserveMovements, monthRef),
  };
}

export async function getChartsData(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  const [entries, monthlyCosts, reserveMovements] = await Promise.all([
    fetchEntriesByMonth(db, userId, monthRef),
    fetchMonthlyCostsByMonth(db, userId, monthRef),
    fetchReserveMovementsUntilMonthEnd(db, userId, monthRef),
  ]);

  const reserveHistory = await buildReserveHistory(db, userId, monthRef, reserveMovements);

  return {
    metrics: buildMonthMetrics(entries, monthlyCosts, reserveMovements, monthRef),
    reserveHistory,
  };
}

export async function getMonthBundle(userId: string, monthRef: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  const [entries, monthlyCosts, reserveMovements] = await Promise.all([
    fetchEntriesByMonth(db, userId, monthRef),
    fetchMonthlyCostsByMonth(db, userId, monthRef),
    fetchReserveMovementsUntilMonthEnd(db, userId, monthRef),
  ]);

  const reserveMovementsMonth = reserveMovements.filter((item) => item.month_ref === monthRef);
  const reserveHistory = await buildReserveHistory(db, userId, monthRef, reserveMovements);

  return {
    entries,
    monthlyCosts,
    reserveMovements,
    reserveMovementsMonth,
    reserveHistory,
    metrics: buildMonthMetrics(entries, monthlyCosts, reserveMovements, monthRef),
  };
}

export async function getReserveMovementById(userId: string, id: string) {
  const supabase = await createClient();
  const db = supabase as DbClient;

  const { data } = await db
    .from("maintenance_reserve_movements")
    .select("id,movement_date,month_ref,movement_type,amount,description")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return (data ?? null) as ReserveMovementRecord | null;
             }
