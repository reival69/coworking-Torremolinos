-- Reservas por hora, día o mes para cualquier cliente registrado (pago por factura)

-- Precios por día y por mes (null = no se ofrece). El precio por hora 0 = no se ofrece.
alter table public.spaces
  add column daily_price_cents integer check (daily_price_cents > 0),
  add column monthly_price_cents integer check (monthly_price_cents > 0);

-- Precios de ejemplo para los espacios iniciales
update public.spaces set daily_price_cents = hourly_price_cents * 7 where kind = 'meeting_room';
update public.spaces set daily_price_cents = 1500, monthly_price_cents = 14900 where kind = 'desk';
update public.spaces set hourly_price_cents = 1500, daily_price_cents = 6000, monthly_price_cents = 59000
  where kind = 'office';

-- Cada reserva guarda su modalidad, cantidad, precio (sin IVA) y la factura que la cobra
alter table public.bookings
  add column unit text not null default 'hour' check (unit in ('hour', 'day', 'month')),
  add column quantity integer not null default 1 check (quantity between 1 and 366),
  add column price_cents integer not null default 0 check (price_cents >= 0),
  add column invoice_id uuid references public.invoices (id) on delete set null;

-- Valida que las fechas encajen con la modalidad y calcula el precio en la base de datos,
-- para que nadie pueda reservar un mes pagando un día ni cambiar el precio desde el navegador.
-- Horario: 8:00–20:00 hora de Madrid (igual que src/app/app/reservas/config.ts).
create or replace function public.prepare_booking()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  s public.spaces%rowtype;
  local_start timestamp := new.starts_at at time zone 'Europe/Madrid';
  local_end timestamp := new.ends_at at time zone 'Europe/Madrid';
  unit_price integer;
begin
  select * into s from public.spaces where id = new.space_id;
  if not found then
    raise exception 'Espacio no encontrado' using errcode = 'P0001';
  end if;

  if new.unit = 'hour' then
    unit_price := nullif(s.hourly_price_cents, 0);
    if new.ends_at <> new.starts_at + make_interval(hours => new.quantity)
      or local_start::time < time '08:00' or local_end::time > time '20:00'
      or local_end::date <> local_start::date then
      raise exception 'Horario no válido' using errcode = 'P0001';
    end if;
  elsif new.unit = 'day' then
    unit_price := s.daily_price_cents;
    if local_start::time <> time '08:00'
      or local_end <> local_start + make_interval(days => new.quantity - 1, hours => 12) then
      raise exception 'Fechas no válidas' using errcode = 'P0001';
    end if;
  else
    unit_price := s.monthly_price_cents;
    if local_start::time <> time '08:00'
      or local_end <> local_start + make_interval(months => new.quantity) then
      raise exception 'Fechas no válidas' using errcode = 'P0001';
    end if;
  end if;

  if unit_price is null then
    raise exception 'Este espacio no se alquila en esa modalidad' using errcode = 'P0001';
  end if;

  new.price_cents := unit_price * new.quantity;
  return new;
end;
$$;
revoke execute on function public.prepare_booking() from public, anon, authenticated;

create trigger bookings_prepare
  before insert on public.bookings
  for each row execute function public.prepare_booking();

-- Un cliente solo puede cancelar sus reservas; no cambiar fechas, precio ni factura
create or replace function public.protect_booking_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.status <> 'cancelled' then
      new.status := old.status;
    end if;
    new.space_id := old.space_id;
    new.member_id := old.member_id;
    new.starts_at := old.starts_at;
    new.ends_at := old.ends_at;
    new.unit := old.unit;
    new.quantity := old.quantity;
    new.price_cents := old.price_cents;
    new.invoice_id := old.invoice_id;
  end if;
  return new;
end;
$$;
revoke execute on function public.protect_booking_fields() from public, anon, authenticated;

create trigger bookings_protect_fields
  before update on public.bookings
  for each row execute function public.protect_booking_fields();

-- Cualquier cliente registrado puede reservar (ya no hace falta membresía activa)
alter policy "bookings_insert" on public.bookings
  with check (
    public.is_admin()
    or (
      member_id = auth.uid()
      and status = 'confirmed'
      and invoice_id is null
      and starts_at > now()
    )
  );
