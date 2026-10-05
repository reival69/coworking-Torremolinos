# Coworking Torremolinos

Web pública + área de miembros + panel de administración para un coworking en Torremolinos.

**Stack:** Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Supabase (Auth + Postgres + RLS) · Vercel.

## Puesta en marcha

1. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta en el SQL Editor, por orden:
   - `supabase/migrations/20261004000000_init.sql`
   - `supabase/migrations/20261004120000_leads.sql`
   - `supabase/migrations/20261005000000_harden_functions.sql`
   - `supabase/migrations/20261005000100_public_catalog_read.sql`
   - `supabase/seed.sql` (tarifas y espacios de ejemplo)
2. Copia `.env.example` a `.env.local` y rellena la URL y la anon key del proyecto.
3. `npm install && npm run dev` → http://localhost:3000
4. Regístrate en `/login?modo=registro` y conviértete en admin desde el SQL Editor:
   ```sql
   update public.profiles set role = 'admin', membership_status = 'active' where email = 'tu@email.com';
   ```

En Supabase → Authentication → URL Configuration, añade `https://<tu-dominio>/auth/callback` como Redirect URL.

## Estructura

| Ruta | Qué hace |
| --- | --- |
| `/` | Landing pública con servicios, tarifas (desde la BD) y ubicación |
| `/contacto` | Formulario de solicitud de información (`?interes=<producto>`) |
| `/login` | Acceso y registro de miembros |
| `/app` | Próximas reservas y estado de la membresía |
| `/app/reservas` | Disponibilidad por espacio y día, reservar por horas |
| `/app/cuenta` | Datos personales/fiscales, plan y facturas |
| `/admin` | Miembros: asignar plan y activar/pausar membresía |
| `/admin/reservas` | Todas las reservas próximas, cancelar |
| `/admin/facturas` | Crear facturas, generar cuotas del mes, marcar cobradas |
| `/admin/contactos` | Solicitudes llegadas desde la web |

## Reglas de negocio

- Solo los miembros con membresía **activa** pueden reservar (lo impone RLS, no solo la UI).
- Postgres impide reservas solapadas del mismo espacio (`exclude using gist`).
- Horario reservable 8:00–20:00, hora de Madrid (`src/app/app/reservas/config.ts`).
- Un miembro no puede cambiarse rol, plan ni estado (trigger `protect_profile_fields`).

Los textos, productos, FAQ y datos de contacto de la web pública están en `src/lib/site.ts`.
