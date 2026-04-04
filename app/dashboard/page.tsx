import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    error?: string;
    success?: string;
  }>;
};

function getMonthRange(monthRef: string) {
  const [year, month] = monthRef.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextDate = new Date(year, month, 1);
  const end = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-01`;

  return { start, end };
}

function currentMonthRef() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentDateRef() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const monthRef = params?.month || currentMonthRef();
  const error = params?.error;
  const success = params?.success;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,email")
    .eq("id", user.id)
    .maybeSingle();

  const range = getMonthRange(monthRef);

  const { data: entriesData } = await supabase
    .from("daily_entries")
    .select("id,date,gross,km,fuel_cost,extras,profit")
    .eq("user_id", user.id)
    .gte("date", range.start)
    .lt("date", range.end)
    .order("date", { ascending: false });

  const { data: monthlyCostsData } = await supabase
    .from("monthly_costs")
    .select(
      "financing,insurance,ipva,oil_maintenance,reserve_maintenance,cellphone,washing,other_monthly"
    )
    .eq("user_id", user.id)
    .eq("month_ref", monthRef)
    .maybeSingle();

  const entries = entriesData ?? [];
  const monthlyCosts = monthlyCostsData ?? null;

  const gross = entries.reduce((acc, item) => acc + Number(item.gross || 0), 0);
  const variable = entries.reduce(
    (acc, item) => acc + Number(item.fuel_cost || 0) + Number(item.extras || 0),
    0
  );

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

  return (
    <DashboardScreen
      userLabel={profile?.name || user.email || "Usuário"}
      userEmail={profile?.email || user.email || ""}
      monthRef={monthRef}
      defaultDate={currentDateRef()}
      error={error}
      success={success}
      metrics={{
        gross,
        variable,
        fixed,
        net,
        workedDays,
        average,
      }}
      monthlyCosts={monthlyCosts}
      entries={entries.map((item) => ({
        id: item.id,
        date: item.date,
        gross: Number(item.gross),
        km: Number(item.km),
        fuel_cost: Number(item.fuel_cost),
        extras: Number(item.extras),
        profit: Number(item.profit),
      }))}
    />
  );
}
