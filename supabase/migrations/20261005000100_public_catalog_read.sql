-- La lectura pública no debe depender de is_admin(), que anon no puede ejecutar.
-- Los admin ven también los inactivos gracias a plans_admin / spaces_admin.
drop policy "plans_read" on public.plans;
create policy "plans_read" on public.plans for select to anon, authenticated using (active);

drop policy "spaces_read" on public.spaces;
create policy "spaces_read" on public.spaces for select to anon, authenticated using (active);
