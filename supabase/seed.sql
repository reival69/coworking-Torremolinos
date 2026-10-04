-- Datos iniciales: tarifas y espacios
insert into public.plans (slug, name, description, price_cents, billing_interval, features, sort_order) values
  ('pase-dia', 'Pase de día', 'Ideal para probar o para nómadas de paso.', 1500, 'day',
    array['Puesto flexible de 9:00 a 20:00', 'Wifi de fibra y café', 'Acceso a zona común'], 1),
  ('flex', 'Flex', 'Puesto flexible para quien viene varios días a la semana.', 14900, 'month',
    array['Puesto flexible L–V', '4 h de sala de reuniones al mes', 'Taquilla', 'Comunidad y eventos'], 2),
  ('fijo', 'Puesto fijo', 'Tu mesa de siempre, lista cuando llegues.', 21900, 'month',
    array['Mesa fija con acceso 24/7', '8 h de sala de reuniones al mes', 'Domiciliación fiscal', 'Taquilla y correo'], 3),
  ('oficina', 'Oficina privada', 'Despacho cerrado para equipos de 2 a 4 personas.', 59000, 'month',
    array['Oficina privada con llave', 'Acceso 24/7', '15 h de sala de reuniones al mes', 'Domiciliación fiscal'], 4);

insert into public.spaces (name, kind, capacity, hourly_price_cents, description) values
  ('Sala Bajondillo', 'meeting_room', 8, 2000, 'Sala de reuniones con pantalla y pizarra.'),
  ('Sala La Carihuela', 'meeting_room', 4, 1200, 'Sala pequeña para llamadas y entrevistas.'),
  ('Puesto flexible 1', 'desk', 1, 300, 'Zona abierta junto a la ventana.'),
  ('Puesto flexible 2', 'desk', 1, 300, 'Zona abierta junto a la ventana.'),
  ('Puesto flexible 3', 'desk', 1, 300, 'Zona abierta, monitor externo.'),
  ('Oficina 1', 'office', 4, 0, 'Oficina privada (solo por contrato mensual).');
