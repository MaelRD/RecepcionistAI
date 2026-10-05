import type { BusinessId, BusinessProfile, DayHours } from '../types'

const week = (
  weekday: [string, string],
  saturday: [string, string] | null,
  sunday: [string, string] | null = null,
): DayHours[] =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const range = day === 0 ? sunday : day === 6 ? saturday : weekday
    return {
      day,
      open: range?.[0] ?? '09:00',
      close: range?.[1] ?? '14:00',
      closed: !range,
    }
  })

export const BUSINESSES: Record<BusinessId, BusinessProfile> = {
  dental: {
    id: 'dental',
    label: 'Clínica dental',
    name: 'Clínica Dental Sonrisa',
    icon: 'tooth',
    accent: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
    currency: 'MXN',
    greeting: 'Bienvenido a Clínica Dental Sonrisa.',
    slotStep: 150,
    demoCustomer: { name: 'Mario', phone: '55 1234 5678' },
    quickPrompts: {
      book: 'Hola, quiero una limpieza dental el sábado.',
      prices: '¿Cuánto cuesta una limpieza y un blanqueamiento?',
      hours: '¿Qué horarios tienen y dónde están?',
      cancel: 'Necesito cancelar mi cita.',
      human: 'Prefiero hablar con una persona, por favor.',
    },
    knowledge: {
      services: [
        { id: 'limpieza', name: 'Limpieza dental', duration: 45, price: 650, description: 'Profilaxis con ultrasonido y pulido.', keywords: ['limpieza', 'profilaxis', 'limpiar'] },
        { id: 'blanqueamiento', name: 'Blanqueamiento', duration: 90, price: 3200, description: 'Blanqueamiento en consultorio con lámpara LED.', keywords: ['blanqueamiento', 'blanquear', 'blancos'] },
        { id: 'valoracion', name: 'Consulta de valoración', duration: 30, price: 350, description: 'Revisión general y plan de tratamiento.', keywords: ['valoración', 'valoracion', 'revisión', 'revision', 'consulta', 'chequeo'] },
        { id: 'resina', name: 'Resina dental', duration: 60, price: 900, description: 'Restauración estética por pieza.', keywords: ['resina', 'caries', 'empaste', 'muela'] },
        { id: 'ortodoncia', name: 'Valoración de ortodoncia', duration: 40, price: 500, description: 'Estudio inicial para brackets o alineadores.', keywords: ['ortodoncia', 'brackets', 'alineadores', 'frenos'] },
      ],
      hours: week(['09:00', '19:00'], ['10:00', '17:00']),
      faqs: [
        { id: 'f1', question: '¿Aceptan seguro dental?', answer: 'Trabajamos con reembolso para la mayoría de aseguradoras. Le entregamos factura y formato de reembolso.', keywords: ['seguro', 'aseguradora', 'reembolso'] },
        { id: 'f2', question: '¿Duele la limpieza?', answer: 'Es un procedimiento cómodo. Si tiene sensibilidad, el especialista puede aplicar anestesia tópica.', keywords: ['duele', 'dolor', 'molesta'] },
        { id: 'f3', question: '¿Tienen estacionamiento?', answer: 'Sí, hay estacionamiento gratuito para pacientes en la planta baja.', keywords: ['estacionamiento', 'estacionar', 'parking'] },
        { id: 'f4', question: '¿Qué formas de pago aceptan?', answer: 'Efectivo, tarjeta de débito y crédito, y transferencia. Meses sin intereses en tratamientos mayores a $3,000.', keywords: ['pago', 'tarjeta', 'efectivo', 'transferencia', 'meses'] },
      ],
      policies: [
        { id: 'p1', title: 'Cancelaciones', body: 'Se pueden cancelar o reagendar citas sin costo con 24 horas de anticipación.' },
        { id: 'p2', title: 'Retrasos', body: 'Con más de 15 minutos de retraso la cita podría reprogramarse.' },
        { id: 'p3', title: 'Diagnósticos', body: 'La recepcionista no da diagnósticos; cualquier valoración la realiza un especialista.' },
      ],
      locations: [
        { id: 'l1', name: 'Sucursal Del Valle', address: 'Av. Coyoacán 1435, Col. Del Valle, CDMX', reference: 'Frente al parque Arboledas' },
      ],
      staff: [
        { id: 's1', name: 'Dra. Ana López', role: 'Odontóloga general', serviceIds: ['limpieza', 'valoracion', 'resina'] },
        { id: 's2', name: 'Dr. Luis Ramírez', role: 'Estética dental', serviceIds: ['blanqueamiento', 'resina'] },
        { id: 's3', name: 'Dra. Paula Vega', role: 'Ortodoncista', serviceIds: ['ortodoncia', 'valoracion'] },
      ],
    },
  },

  nails: {
    id: 'nails',
    label: 'Estudio de uñas',
    name: 'Nailed Studio',
    icon: 'nails',
    accent: { 50: '#fdf2f8', 100: '#fce7f3', 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
    currency: 'MXN',
    greeting: 'Hola, bienvenida a Nailed Studio.',
    slotStep: 90,
    demoCustomer: { name: 'Valeria', phone: '55 2345 6789' },
    quickPrompts: {
      book: 'Hola, quiero agendar uñas acrílicas para el viernes.',
      prices: '¿Cuánto cuesta el gelish y el acrílico?',
      hours: '¿A qué hora abren el fin de semana?',
      cancel: 'Quiero cancelar mi cita de uñas.',
      human: 'Necesito hablar con alguien del estudio.',
    },
    knowledge: {
      services: [
        { id: 'gelish', name: 'Manicure gelish', duration: 60, price: 380, description: 'Esmaltado semipermanente con preparación de cutícula.', keywords: ['gelish', 'manicure', 'semipermanente', 'manos'] },
        { id: 'acrilico', name: 'Uñas acrílicas', duration: 120, price: 650, description: 'Aplicación completa con diseño sencillo.', keywords: ['acrílico', 'acrilico', 'acrílicas', 'acrilicas', 'esculpidas'] },
        { id: 'pedicure', name: 'Pedicure spa', duration: 75, price: 450, description: 'Exfoliación, hidratación y esmaltado.', keywords: ['pedicure', 'pies'] },
        { id: 'retiro', name: 'Retiro de producto', duration: 30, price: 150, description: 'Retiro seguro de gel o acrílico.', keywords: ['retiro', 'retirar', 'quitar'] },
        { id: 'nailart', name: 'Nail art', duration: 45, price: 250, description: 'Diseño a mano alzada (precio por set).', keywords: ['diseño', 'diseno', 'nail art', 'decorado'] },
      ],
      hours: week(['10:00', '20:00'], ['09:00', '18:00'], ['10:00', '15:00']),
      faqs: [
        { id: 'f1', question: '¿Cuánto dura el gelish?', answer: 'Entre 2 y 3 semanas con los cuidados adecuados.', keywords: ['dura', 'duración', 'duracion'] },
        { id: 'f2', question: '¿Puedo llevar mi diseño?', answer: 'Claro, puede enviarnos una foto de referencia y la técnica le confirma tiempo y costo.', keywords: ['foto', 'referencia', 'mi diseño'] },
        { id: 'f3', question: '¿Piden anticipo?', answer: 'Para sets mayores a $600 pedimos un anticipo de $150 por transferencia.', keywords: ['anticipo', 'depósito', 'deposito'] },
      ],
      policies: [
        { id: 'p1', title: 'Tolerancia', body: 'Tolerancia de 10 minutos; después se ajusta el servicio al tiempo restante.' },
        { id: 'p2', title: 'Cancelaciones', body: 'Cancelaciones con menos de 12 horas pierden el anticipo.' },
      ],
      locations: [
        { id: 'l1', name: 'Nailed Roma', address: 'Colima 220, Roma Norte, CDMX', reference: 'Local 3, segundo piso' },
      ],
      staff: [
        { id: 's1', name: 'Fer', role: 'Nail artist', serviceIds: ['acrilico', 'nailart', 'gelish'] },
        { id: 's2', name: 'Caro', role: 'Manicurista', serviceIds: ['gelish', 'pedicure', 'retiro'] },
      ],
    },
  },

  barber: {
    id: 'barber',
    label: 'Barbería',
    name: 'Barbería Norte',
    icon: 'barber',
    accent: { 50: '#fffbeb', 100: '#fef3c7', 500: '#d97706', 600: '#b45309', 700: '#92400e' },
    currency: 'MXN',
    greeting: 'Qué tal, bienvenido a Barbería Norte.',
    slotStep: 45,
    demoCustomer: { name: 'Diego', phone: '81 3456 7890' },
    quickPrompts: {
      book: 'Quiero un corte con barba mañana.',
      prices: '¿Cuánto sale el corte y la barba?',
      hours: '¿Abren el domingo?',
      cancel: 'Tengo que cancelar mi cita.',
      human: 'Quiero hablar con el encargado.',
    },
    knowledge: {
      services: [
        { id: 'corte', name: 'Corte clásico', duration: 40, price: 250, description: 'Corte con máquina y tijera, lavado incluido.', keywords: ['corte', 'cortar', 'pelo', 'cabello'] },
        { id: 'combo', name: 'Corte + barba', duration: 60, price: 380, description: 'Corte completo y perfilado de barba con toalla caliente.', keywords: ['barba y corte', 'corte con barba', 'combo', 'corte + barba'] },
        { id: 'barba', name: 'Perfilado de barba', duration: 30, price: 180, description: 'Diseño de barba con navaja y aceites.', keywords: ['barba', 'perfilado', 'afeitado', 'rasurado'] },
        { id: 'fade', name: 'Fade / degradado', duration: 50, price: 300, description: 'Degradado a detalle con acabado a navaja.', keywords: ['fade', 'degradado', 'desvanecido'] },
      ],
      hours: week(['10:00', '21:00'], ['09:00', '20:00'], ['10:00', '16:00']),
      faqs: [
        { id: 'f1', question: '¿Atienden sin cita?', answer: 'Sí, pero quienes tienen cita tienen prioridad. Recomendamos reservar.', keywords: ['sin cita', 'walk', 'llegar'] },
        { id: 'f2', question: '¿Tienen corte para niños?', answer: 'Sí, el corte infantil (hasta 12 años) cuesta $180.', keywords: ['niño', 'niños', 'infantil', 'hijo'] },
      ],
      policies: [
        { id: 'p1', title: 'Puntualidad', body: 'Si llegas 10 minutos tarde, tu lugar se libera para el siguiente cliente.' },
      ],
      locations: [
        { id: 'l1', name: 'Barbería Norte · San Pedro', address: 'Calzada del Valle 400, San Pedro Garza García, NL', reference: 'Plaza Valle, local 12' },
      ],
      staff: [
        { id: 's1', name: 'Toño', role: 'Barbero senior', serviceIds: ['corte', 'combo', 'fade', 'barba'] },
        { id: 's2', name: 'Kevin', role: 'Barbero', serviceIds: ['corte', 'fade', 'barba'] },
        { id: 's3', name: 'Rafa', role: 'Barbero', serviceIds: ['combo', 'barba'] },
      ],
    },
  },

  psychology: {
    id: 'psychology',
    label: 'Psicología',
    name: 'Centro Mente Clara',
    icon: 'psychology',
    accent: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669', 700: '#047857' },
    currency: 'MXN',
    greeting: 'Bienvenido a Centro Mente Clara.',
    slotStep: 60,
    demoCustomer: { name: 'Laura', phone: '33 4567 8901' },
    quickPrompts: {
      book: 'Hola, me gustaría agendar una primera consulta el martes.',
      prices: '¿Cuál es el costo de la terapia individual?',
      hours: '¿Qué horarios tienen disponibles?',
      cancel: 'Necesito cancelar mi sesión.',
      human: 'Quisiera hablar directamente con una persona.',
    },
    knowledge: {
      services: [
        { id: 'primera', name: 'Primera consulta', duration: 60, price: 700, description: 'Entrevista inicial y definición de objetivos terapéuticos.', keywords: ['primera', 'inicial', 'primera vez', 'primera consulta'] },
        { id: 'individual', name: 'Terapia individual', duration: 50, price: 850, description: 'Sesión individual presencial u online.', keywords: ['terapia', 'individual', 'sesión', 'sesion'] },
        { id: 'pareja', name: 'Terapia de pareja', duration: 80, price: 1200, description: 'Sesión con ambos miembros de la pareja.', keywords: ['pareja', 'novio', 'novia', 'esposo', 'esposa'] },
        { id: 'online', name: 'Sesión online', duration: 50, price: 750, description: 'Videollamada por plataforma segura.', keywords: ['online', 'en línea', 'en linea', 'videollamada', 'virtual'] },
      ],
      hours: week(['08:00', '20:00'], ['09:00', '14:00']),
      faqs: [
        { id: 'f1', question: '¿Las sesiones son confidenciales?', answer: 'Sí. Toda la información está protegida por secreto profesional.', keywords: ['confidencial', 'privado', 'secreto'] },
        { id: 'f2', question: '¿Cuántas sesiones necesito?', answer: 'Depende de cada proceso; su terapeuta lo definirá con usted en la primera consulta.', keywords: ['cuántas', 'cuantas', 'cuanto tiempo'] },
        { id: 'f3', question: '¿Atienden crisis?', answer: 'No somos un servicio de emergencia. Si está en riesgo, llame a la Línea de la Vida: 800 911 2000.', keywords: ['crisis', 'emergencia', 'urgente'] },
      ],
      policies: [
        { id: 'p1', title: 'Diagnósticos', body: 'La recepcionista nunca ofrece diagnósticos ni orientación clínica.' },
        { id: 'p2', title: 'Cancelaciones', body: 'Las sesiones canceladas con menos de 24 horas se cobran completas.' },
      ],
      locations: [
        { id: 'l1', name: 'Consultorio Providencia', address: 'Av. Providencia 2550, Guadalajara, Jal.', reference: 'Torre Médica, piso 4' },
        { id: 'l2', name: 'Online', address: 'Videollamada segura', reference: 'El enlace se envía 1 hora antes' },
      ],
      staff: [
        { id: 's1', name: 'Psic. Andrea Torres', role: 'Terapia cognitivo-conductual', serviceIds: ['primera', 'individual', 'online'] },
        { id: 's2', name: 'Psic. Jorge Medina', role: 'Terapia de pareja', serviceIds: ['pareja', 'primera'] },
      ],
    },
  },

  tattoo: {
    id: 'tattoo',
    label: 'Estudio de tatuajes',
    name: 'Tinta Negra Tattoo',
    icon: 'tattoo',
    accent: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
    currency: 'MXN',
    greeting: 'Hola, bienvenido a Tinta Negra.',
    slotStep: 180,
    demoCustomer: { name: 'Sebastián', phone: '55 5678 9012' },
    quickPrompts: {
      book: 'Quiero agendar una cotización para un tatuaje el jueves.',
      prices: '¿Cuánto cuesta un tatuaje pequeño?',
      hours: '¿Qué días trabajan?',
      cancel: 'Quiero cancelar mi sesión de tatuaje.',
      human: 'Quiero hablar con el tatuador directamente.',
    },
    knowledge: {
      services: [
        { id: 'cotizacion', name: 'Cotización de diseño', duration: 30, price: 0, description: 'Revisión de idea, zona y tamaño. Sin costo.', keywords: ['cotización', 'cotizacion', 'cotizar', 'presupuesto', 'idea'] },
        { id: 'pequeno', name: 'Tatuaje pequeño', duration: 90, price: 1200, description: 'Hasta 8 cm, línea fina o blackwork sencillo.', keywords: ['pequeño', 'pequeno', 'chico', 'minimalista', 'fine line'] },
        { id: 'sesion', name: 'Sesión completa', duration: 300, price: 4500, description: 'Sesión de 5 horas para piezas medianas o grandes.', keywords: ['sesión completa', 'sesion completa', 'grande', 'manga', 'mediano'] },
        { id: 'retoque', name: 'Retoque', duration: 60, price: 500, description: 'Retoque de tatuajes realizados en el estudio.', keywords: ['retoque', 'retocar'] },
      ],
      hours: week(['12:00', '21:00'], ['11:00', '19:00']),
      faqs: [
        { id: 'f1', question: '¿Se necesita anticipo?', answer: 'Sí, $500 de anticipo para apartar fecha; se descuenta del total.', keywords: ['anticipo', 'depósito', 'deposito'] },
        { id: 'f2', question: '¿Tatúan a menores?', answer: 'No tatuamos a menores de 18 años, incluso con permiso.', keywords: ['menor', 'menores', 'edad', '17'] },
        { id: 'f3', question: '¿Cómo cuido mi tatuaje?', answer: 'Le entregamos una guía de cuidados; lavar 2 veces al día y crema cicatrizante por 2 semanas.', keywords: ['cuido', 'cuidado', 'cuidados', 'sanar'] },
      ],
      policies: [
        { id: 'p1', title: 'Anticipos', body: 'El anticipo no es reembolsable, pero puede moverse de fecha una vez.' },
        { id: 'p2', title: 'Identificación', body: 'Se requiere identificación oficial el día de la sesión.' },
      ],
      locations: [
        { id: 'l1', name: 'Tinta Negra · Condesa', address: 'Av. Tamaulipas 66, Condesa, CDMX', reference: 'Timbre B' },
      ],
      staff: [
        { id: 's1', name: 'Nico', role: 'Blackwork / fine line', serviceIds: ['cotizacion', 'pequeno', 'retoque'] },
        { id: 's2', name: 'Majo', role: 'Realismo', serviceIds: ['cotizacion', 'sesion', 'retoque'] },
      ],
    },
  },
}

export const BUSINESS_ORDER: BusinessId[] = ['dental', 'nails', 'barber', 'psychology', 'tattoo']
