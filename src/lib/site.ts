// Datos de contacto del centro. Rellenar cuando estén confirmados:
// los campos en null se ocultan en la web.
export const SITE = {
  name: "Coworking Torremolinos",
  city: "Torremolinos, Málaga",
  address: null as string | null,
  phone: null as string | null, // ej. "+34 952 00 00 00"
  whatsapp: null as string | null, // solo dígitos, ej. "34600000000"
  email: null as string | null,
  hours: "Lunes a viernes, 8:00–20:00",
};

const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const PHOTOS = {
  hero: unsplash("1497215728101-856f4ea42174", 1600),
  beach: unsplash("1507525428034-b723cf961d3e"),
  lounge: unsplash("1524758631624-e2822e304c36"),
  community: unsplash("1556761175-5973dc0f32e7"),
  hotDesk: unsplash("1527192491265-7e15c55b1ed2", 800),
  fixedDesk: unsplash("1568992687947-868a62a9f521", 800),
  office: unsplash("1497366216548-37526070297c", 800),
  meetingRoom: unsplash("1517502884422-41eaead166d4", 800),
  virtualOffice: unsplash("1519389950473-47ba0277781c", 800),
  events: unsplash("1542744173-8e7e53415bb0", 800),
};

export const PRODUCTS = [
  {
    slug: "puesto-flexible",
    name: "Puesto flexible",
    tagline: "Por día o por mes, siéntate donde quieras.",
    from: "desde 15 €/día",
    photo: PHOTOS.hotDesk,
  },
  {
    slug: "puesto-fijo",
    name: "Puesto fijo",
    tagline: "Tu mesa de siempre, con acceso 24/7.",
    from: "desde 219 €/mes",
    photo: PHOTOS.fixedDesk,
  },
  {
    slug: "oficina-privada",
    name: "Oficina privada",
    tagline: "Despacho cerrado para equipos de 1 a 4 personas.",
    from: "desde 590 €/mes",
    photo: PHOTOS.office,
  },
  {
    slug: "sala-reuniones",
    name: "Salas de reuniones",
    tagline: "Reserva por horas, con pantalla y pizarra.",
    from: "desde 12 €/hora",
    photo: PHOTOS.meetingRoom,
  },
  {
    slug: "oficina-virtual",
    name: "Oficina virtual",
    tagline: "Domiciliación fiscal y gestión de correo.",
    from: "consúltanos",
    photo: PHOTOS.virtualOffice,
  },
  {
    slug: "eventos",
    name: "Eventos y formación",
    tagline: "Talleres, presentaciones y networking.",
    from: "consúltanos",
    photo: PHOTOS.events,
  },
] as const;

export const EXTRA_SERVICES = [
  "Domiciliación fiscal",
  "Recepción de paquetes y correo",
  "Taquillas",
  "Impresión y escáner",
  "Sala para entrevistas",
  "Llamadas en cabina",
  "Pase de 10 días",
  "Tarifas para equipos",
];

export const FAQS = [
  {
    q: "¿Puedo venir a probar antes de contratar?",
    a: "Sí. Escríbenos y te reservamos un día de prueba para que conozcas el espacio y a la comunidad.",
  },
  {
    q: "¿Hay permanencia?",
    a: "No. Los planes mensuales se renuevan mes a mes y puedes darte de baja cuando quieras.",
  },
  {
    q: "¿Cómo reservo una sala de reuniones?",
    a: "Desde tu área de cliente: eliges el espacio y si lo quieres por horas, días o meses. La reserva queda confirmada al momento y te enviamos la factura.",
  },
  {
    q: "¿Puedo usar la dirección del coworking para mi empresa?",
    a: "Sí, con el puesto fijo, la oficina privada o la oficina virtual incluimos domiciliación fiscal y recepción de correo.",
  },
  {
    q: "¿Qué incluye el precio?",
    a: "Wifi de fibra, café, limpieza, suministros y acceso a las zonas comunes. Los precios no incluyen IVA.",
  },
  {
    q: "¿Cómo llego?",
    a: "Estamos en el centro de Torremolinos, bien comunicados con el Cercanías Málaga–Fuengirola y a pocos minutos del aeropuerto.",
  },
];
