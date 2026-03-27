// Shared tag and mood emoji definitions for CaptureInput and PostCard

export const TAG_EMOJIS = ['🧠', '📝', '💡', '📌', '❓', '🎯'] as const
export const MOOD_EMOJIS = ['😊', '😤', '😌', '😩', '🙌', '🤔', '😴', '😅', '🎉', '😮‍💨', '👍', '😬'] as const

export type TagOption = { emoji: string; tag: string; name: string }

export const DEFAULT_TAG_OPTIONS: TagOption[] = [
  { emoji: '🧠', tag: 'thoughts', name: 'thoughts' },
  { emoji: '📝', tag: 'todo', name: 'todo' },
  { emoji: '💡', tag: 'idea', name: 'idea' },
  { emoji: '📌', tag: 'priority', name: 'priority' },
  { emoji: '❓', tag: 'question', name: 'question' },
  { emoji: '🎯', tag: 'goal', name: 'goal' },
]

/** @deprecated Use DEFAULT_TAG_OPTIONS or tagOptionsStore */
export const TAG_OPTIONS = DEFAULT_TAG_OPTIONS

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalize(s: string): string {
  return s.normalize ? s.normalize('NFC') : s
}

/** Extract all tag emojis found in content (order preserved). Pass tagOptions to include custom tags. */
export function parseTagEmojis(
  content: string,
  tagOptions: { emoji: string }[] = DEFAULT_TAG_OPTIONS
): string[] {
  const n = normalize(content)
  const found: string[] = []
  const seen = new Set<string>()
  for (const opt of tagOptions) {
    const em = opt.emoji
    if (!seen.has(em) && n.includes(normalize(em))) {
      seen.add(em)
      found.push(em)
    }
  }
  return found
}

/** Extract all mood emojis found in content (order preserved) */
export function parseMoodEmojis(content: string): string[] {
  const n = normalize(content)
  const found: string[] = []
  for (const emoji of MOOD_EMOJIS) {
    if (n.includes(normalize(emoji))) found.push(emoji)
  }
  return found
}

/** @deprecated Use parseTagEmojis */
export function parseTagEmoji(content: string): string | null {
  const arr = parseTagEmojis(content)
  return arr[0] ?? null
}

/** @deprecated Use parseMoodEmojis */
export function parseMoodEmoji(content: string): string | null {
  const arr = parseMoodEmojis(content)
  return arr[0] ?? null
}

function buildTagToHashtag(opts: { emoji: string; tag: string }[]): Record<string, string> {
  const r: Record<string, string> = {}
  for (const o of opts) r[o.emoji] = o.tag
  return r
}

export const MOOD_ALIASES: Record<string, string> = {
  happy: '😊', mad: '😤', chill: '😌', tired: '😩',
  hyped: '🙌', thinking: '🤔', sleepy: '😴', awkward: '😅',
  party: '🎉', sigh: '😮‍💨', good: '👍', yikes: '😬',
}

/**
 * Replace `/tag` with emoji + #hashtag, and `:mood` with the mood emoji.
 * Runs once on submit so stored content matches tap-button output.
 */
export function resolveShortcuts(
  text: string,
  tagOptions: TagOption[] = DEFAULT_TAG_OPTIONS
): string {
  let result = text

  for (const opt of tagOptions) {
    const pattern = new RegExp(`/${escapeRegex(opt.tag)}(?=\\s|$)`, 'gi')
    result = result.replace(pattern, `${opt.emoji} #${opt.tag}`)
  }

  for (const [alias, emoji] of Object.entries(MOOD_ALIASES)) {
    const pattern = new RegExp(`:${escapeRegex(alias)}(?=\\s|$)`, 'gi')
    result = result.replace(pattern, emoji)
  }

  return result
}

/** Strip tag and mood emojis (and their #hashtags) from content for display. Pass tagOptions to include custom tags. */
export function stripTagAndMoodForDisplay(
  content: string,
  tagOptions: { emoji: string; tag: string }[] = DEFAULT_TAG_OPTIONS
): string {
  let result = content
  const tagToHashtag = buildTagToHashtag(tagOptions)
  for (const opt of tagOptions) {
    const emoji = opt.emoji
    const hashtag = tagToHashtag[emoji]
    result = result.split(emoji).join('')
    if (hashtag) {
      result = result.replace(new RegExp(`#${escapeRegex(hashtag)}\\s*`, 'g'), '')
    }
  }
  // Remove all mood emojis
  for (const emoji of MOOD_EMOJIS) {
    result = result.split(emoji).join('')
  }
  return result.replace(/\s+/g, ' ').trim()
}
