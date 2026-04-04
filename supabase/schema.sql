create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  gross numeric(12,2) not null default 0,
  km numeric(12,2) not null default 0,
  fuel_price numeric(12,2) not null default 0,
  consumption numeric(12,2) not null default 0,
  extras numeric(12,2) not null default 0,
  fuel_cost numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_ref text not null,
  financing numeric(12,2) not null default 0,
  insurance numeric(12,2) not null default 0,
  ipva numeric(12,2) not null default 0,
  oil_maintenance numeric(12,2) not null default 0,
  reserve_maintenance numeric(12,2) not null default 0,
  cellphone numeric(12,2) not null default 0,
  washing numeric(12,2) not null default 0,
  other_monthly numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month_ref)
);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;
alter table public.monthly_costs enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "daily_entries_select_own" on public.daily_entries
  for select using (auth.uid() = user_id);

create policy "daily_entries_insert_own" on public.daily_entries
  for insert with check (auth.uid() = user_id);

create policy "daily_entries_update_own" on public.daily_entries
  for update using (auth.uid() = user_id);

create policy "daily_entries_delete_own" on public.daily_entries
  for delete using (auth.uid() = user_id);

create policy "monthly_costs_select_own" on public.monthly_costs
  for select using (auth.uid() = user_id);

create policy "monthly_costs_insert_own" on public.monthly_costs
  for insert with check (auth.uid() = user_id);

create policy "monthly_costs_update_own" on public.monthly_costs
  for update using (auth.uid() = user_id);

create policy "monthly_costs_delete_own" on public.monthly_costs
  for delete using (auth.uid() = user_id);
