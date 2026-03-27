import type { Post } from '@/lib/supabase'

/**
 * Calendar day in the user's local timezone (device clock).
 * Use for grouping feed posts; Supabase stores UTC — convert via Date.
 */
export function localDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return localDayKey(new Date())
}

export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localDayKey(d)
}

/** Group posts by local calendar day; newest first within each day. */
export function groupPostsByLocalDay(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>()
  for (const p of posts) {
    const key = localDayKey(p.created_at)
    const arr = map.get(key) ?? []
    arr.push(p)
    map.set(key, arr)
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return map
}

/** Day keys strictly before today, sorted newest first. */
export function previousDayEntries(map: Map<string, Post[]>, todayK: string): { dayKey: string; posts: Post[] }[] {
  return [...map.entries()]
    .filter(([k]) => k < todayK)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dayKey, posts]) => ({ dayKey, posts }))
}

/** Label for a past day row: Yesterday, weekday + date, or with year if different year. */
export function formatPastDayLabel(dayKey: string): string {
  const yest = yesterdayKey()
  if (dayKey === yest) return 'Yesterday'

  const d = new Date(`${dayKey}T12:00:00`)
  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}
