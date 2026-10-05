# Roadmap — Coworking Torremolinos

## Hecho
- [x] Next.js 16 + Tailwind 4, tema mediterráneo (arena / terracota / mar)
- [x] Esquema Supabase: planes, espacios, perfiles, reservas, facturas + RLS
- [x] Landing pública con tarifas desde la BD (con datos de respaldo sin BD)
- [x] Registro / login con email y contraseña
- [x] Reservas por horas con disponibilidad y bloqueo de solapes en BD
- [x] Mi cuenta: datos fiscales, plan, facturas
- [x] Admin: miembros, reservas, facturas manuales y cuotas mensuales
- [x] Landing estilo Regus: menú de productos, 6 productos con foto, servicios, beneficios, FAQ
- [x] Formulario de contacto (`/contacto`) → tabla `leads` + bandeja en `/admin/contactos`

## Pendiente
- [ ] Crear proyecto Supabase, aplicar migración y seed, configurar `.env.local`
- [ ] Desplegar en Vercel y conectar dominio
- [ ] Pagos con Stripe (Checkout para facturas pendientes + webhook que las marque cobradas)
- [ ] PDF de factura con datos fiscales del coworking
- [ ] Bolsa de horas de sala incluidas en cada plan y cobro de horas extra
- [ ] Emails: confirmación de reserva y recordatorio
- [ ] Contenido real en `src/lib/site.ts`: dirección, teléfono/WhatsApp, email, fotos propias, mapa
- [ ] Aviso por email al admin cuando llega un contacto nuevo
- [ ] Recuperar contraseña
