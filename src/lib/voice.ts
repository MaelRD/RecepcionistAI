import type { AISettings } from '../types'

/**
 * Traduce la configuración de personalidad (tono, emojis, instrucciones)
 * en pequeñas decisiones de redacción que usa el motor de conversación.
 */
export const createVoice = (settings: AISettings) => {
  const usted =
    settings.tone !== 'casual' ||
    settings.instructions.some((i) => i.enabled && /usted/i.test(i.text))
  const emojiLevel = { ninguno: 0, bajo: 1, normal: 2 }[settings.emojis]

  return {
    usted,
    /** Elige la variante formal (usted) o informal (tú). */
    t: (formal: string, informal: string) => (usted ? formal : informal),
    /** Agrega un emoji si el nivel configurado lo permite. */
    e: (emoji: string, minLevel: 1 | 2 = 1) => (emojiLevel >= minLevel ? ` ${emoji}` : ''),
    ok: () =>
      ({ profesional: 'Perfecto.', cercano: '¡Perfecto!', casual: '¡Listo!' })[settings.tone],
    sure: () => ({ profesional: 'Claro.', cercano: '¡Claro!', casual: '¡Va!' })[settings.tone],
    thanks: () =>
      ({
        profesional: 'Con gusto. Quedo a sus órdenes.',
        cercano: '¡Con mucho gusto! Aquí estoy para lo que necesite.',
        casual: '¡De nada! Aquí andamos para lo que ocupes.',
      })[settings.tone],
  }
}

export type Voice = ReturnType<typeof createVoice>

export const hasInstruction = (settings: AISettings, pattern: RegExp) =>
  settings.instructions.some((i) => i.enabled && pattern.test(i.text))
