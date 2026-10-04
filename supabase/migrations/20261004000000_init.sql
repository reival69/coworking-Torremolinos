-- Coworking Torremolinos — esquema inicial
create extension if not exists btree_gist;

-- Planes de membresía ------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  billing_interval text not null check (billing_interval in ('day', 'month')),
  features text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Espacios reservables ------------------------------------------------------
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('desk', 'meeting_room', 'office')),
  capacity integer not null default 1 check (capacity > 0),
  hourly_price_cents integer not null default 0 check (hourly_price_cents >= 0),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Perfiles de miembros ------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  company text,
  tax_id text,
  role text not null default 'member' check (role in ('member', 'admin')),
  plan_id uuid references public.plans (id) on delete set null,
  requested_plan_slug text,
  membership_status text not null default 'pending'
    check (membership_status in ('pending', 'active', 'paused', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Reservas -----------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Un mismo espacio no puede tener dos reservas confirmadas solapadas
  exclude using gist (
    space_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status = 'confirmed')
);
create index bookings_member_idx on public.bookings (member_id, starts_at);

-- Facturas -----------------------------------------------------------------
create sequence public.invoice_number_seq;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique
    default ('CT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0')),
  member_id uuid not null references public.profiles (id) on delete cascade,
  concept text not null,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'void')),
  issued_on date not null default current_date,
  due_on date not null default (current_date + 15),
  paid_at timestamptz,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);
create index invoices_member_idx on public.invoices (member_id, issued_on desc);

-- Helpers ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Crea el perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, requested_plan_slug)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'requested_plan'
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un miembro no puede cambiarse el rol, el plan ni el estado de su membresía
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.plan_id := old.plan_id;
    new.membership_status := old.membership_status;
    new.email := old.email;
  end if;
  return new;
end;
$$;
create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Huecos ocupados de un espacio en un rango, sin exponer quién reservó
create or replace function public.space_busy_slots(p_space_id uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.starts_at, b.ends_at
  from public.bookings b
  where b.space_id = p_space_id
    and b.status = 'confirmed'
    and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_from, p_to, '[)');
$$;
revoke execute on function public.space_busy_slots(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.space_busy_slots(uuid, timestamptz, timestamptz) to authenticated;

-- RLS ----------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.spaces enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;

-- Planes y espacios: lectura pública (la landing los muestra), escritura admin
create policy "plans_read" on public.plans for select using (active or public.is_admin());
create policy "plans_admin" on public.plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "spaces_read" on public.spaces for select using (active or public.is_admin());
create policy "spaces_admin" on public.spaces for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Perfiles
create policy "profiles_own_read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles_own_update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles_admin_delete" on public.profiles for delete to authenticated
  using (public.is_admin());

-- Reservas: cada miembro activo gestiona las suyas; admin todas
create policy "bookings_read" on public.bookings for select to authenticated
  using (member_id = auth.uid() or public.is_admin());
create policy "bookings_insert" on public.bookings for insert to authenticated
  with check (
    public.is_admin()
    or (
      member_id = auth.uid()
      and status = 'confirmed'
      and starts_at > now()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.membership_status = 'active')
    )
  );
create policy "bookings_update" on public.bookings for update to authenticated
  using (member_id = auth.uid() or public.is_admin())
  with check (member_id = auth.uid() or public.is_admin());

-- Facturas: el miembro solo las ve; el admin las gestiona
create policy "invoices_read" on public.invoices for select to authenticated
  using (member_id = auth.uid() or public.is_admin());
create policy "invoices_admin" on public.invoices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
