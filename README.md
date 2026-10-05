# Recepcionista IA · Demo interactiva

Demo de portafolio: una recepcionista con IA que atiende clientes, agenda citas y automatiza procesos 24/7.
Todo funciona en el navegador (sin backend): lógica simulada, datos mock y `localStorage`.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # genera dist/
npm run preview
```

Añade `?static` a la URL para desactivar animaciones (útil para capturas).

## Despliegue en Netlify

`netlify.toml` ya define `npm run build` → `dist`. Conecta el repo o arrastra `dist/` a Netlify.
El formulario "Cuéntame cómo trabajas" usa **Netlify Forms** (formulario `lead`, declarado oculto en `index.html`);
los envíos aparecen en el panel de Netlify → Forms.

## Estructura

```
src/
  types/            Tipos del dominio (negocio, knowledge, citas, conversación)
  data/             Mock data: 5 negocios, métricas, automatizaciones, seeds
  lib/
    engine.ts       Motor de conversación (intención, slots, disponibilidad, efectos) — lógica pura
    voice.ts        Tono, emojis e instrucciones → redacción
    labels.ts       Etiquetas de pasos, intents y estados
  context/
    AppStore.tsx            Estado global persistido (negocio, knowledge, settings, agenda, clientes…)
    ConversationContext.tsx Reproduce cada turno: pasos → typing → respuestas, demo automática
    LeadContext.tsx         Modal de CTA
  components/       layout/, chat/, overview/, ui/
  pages/            Overview, Conversations, Agenda, Customers, Knowledge, Automations, Settings
```

## Qué se puede probar

- Escribir libremente o usar acciones rápidas: agendar, precios, horarios, cancelar/reagendar, hablar con una persona.
- **Demo automática**: reproduce una reserva completa escribiendo como cliente.
- Cambiar de negocio (dental, uñas, barbería, psicología, tatuajes): cambian servicios, precios, horarios, personal, FAQs y color.
- Editar la Knowledge base → la IA responde con los datos nuevos.
- AI Settings: nombre, tono, emojis e instrucciones (p. ej. desactivar "Confirmar…" hace que agende sin confirmar).
- Automations: activar/desactivar cambia el comportamiento del chat (reserva pendiente, sin escalamiento…).
- Agenda y Customers se actualizan con lo que ocurre en el chat.
