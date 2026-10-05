-- Solicitudes de información desde la web pública
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 40),
  interest text check (char_length(interest) <= 60),
  message text check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  created_at timestamptz not null default now()
);
create index leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- Cualquiera puede enviar el formulario, pero solo el admin puede leerlo
create policy "leads_public_insert" on public.leads for insert to anon, authenticated
  with check (status = 'new');
create policy "leads_admin" on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
