-- Funciones de trigger: no deben poder llamarse por la API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;

-- Extensión fuera del esquema expuesto
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
