/** Short quotes for empty-today state; index chosen deterministically per calendar day. */
export const DAILY_QUOTES: string[] = [
  'Capture first. Review later.',
  'One line is enough to start.',
  'Thoughts evaporate — write the gist.',
  'Small notes beat perfect notes.',
  'The feed is for you, not the algorithm.',
  'Later-you will thank present-you.',
  'Frictionless beats organized.',
  'Show up. Type something. Done.',
  'Your future self is reading this.',
  'No blank page — just a blank moment.',
]

export function quoteIndexForDay(dayKey: string): number {
  let h = 0
  for (let i = 0; i < dayKey.length; i++) {
    h = (h * 31 + dayKey.charCodeAt(i)) | 0
  }
  return Math.abs(h) % DAILY_QUOTES.length
}

export function quoteForDay(dayKey: string): string {
  return DAILY_QUOTES[quoteIndexForDay(dayKey)]
}
