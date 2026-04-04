import { redirect } from "next/navigation";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params?.month) query.set("month", params.month);
  if (params?.error) query.set("error", params.error);
  if (params?.success) query.set("success", params.success);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/panel/dashboard${suffix}`);
}
