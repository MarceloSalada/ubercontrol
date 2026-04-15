create table if not exists public.maintenance_reserve_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movement_date date not null,
  month_ref text not null,
  movement_type text not null check (movement_type in ('deposit', 'expense', 'adjustment')),
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  created_at timestamptz not null default now()
);

alter table public.maintenance_reserve_movements enable row level security;

create policy "maintenance_reserve_movements_select_own" on public.maintenance_reserve_movements
  for select using (auth.uid() = user_id);

create policy "maintenance_reserve_movements_insert_own" on public.maintenance_reserve_movements
  for insert with check (auth.uid() = user_id);

create policy "maintenance_reserve_movements_update_own" on public.maintenance_reserve_movements
  for update using (auth.uid() = user_id);

create policy "maintenance_reserve_movements_delete_own" on public.maintenance_reserve_movements
  for delete using (auth.uid() = user_id);

create index if not exists maintenance_reserve_movements_user_date_idx
  on public.maintenance_reserve_movements (user_id, movement_date desc);

create index if not exists maintenance_reserve_movements_user_month_idx
  on public.maintenance_reserve_movements (user_id, month_ref);

-- Observação funcional:
-- reserve_maintenance em monthly_costs passa a representar o aporte planejado do mês.
-- oil_maintenance deixa de ser usado na interface e pode ser removido depois da migração completa.
