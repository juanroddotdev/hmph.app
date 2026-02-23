import type { TimeFormat } from '@/stores/settingsStore'

const FRIENDLY_BUCKETS: { label: string; start: number; end: number }[] = [
  { label: 'sleep', start: 22, end: 6 },
  { label: 'morning', start: 6, end: 10 },
  { label: 'brunch', start: 10, end: 12 },
  { label: 'day', start: 12, end: 17 },
  { label: 'after-work', start: 17, end: 22 },
]

function getFriendlyBucket(date: Date): string {
  const h = date.getHours()
  for (const { label, start, end } of FRIENDLY_BUCKETS) {
    if (start > end) {
      if (h >= start || h < end) return label
    } else if (h >= start && h < end) {
      return label
    }
  }
  return 'day'
}

export function formatPostTime(isoString: string, format: TimeFormat): string {
  const d = new Date(isoString)
  const dateStr = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })

  if (format === 'friendly') {
    return `${dateStr} · ${getFriendlyBucket(d)}`
  }

  const timeStr =
    format === 'military'
      ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })

  return `${dateStr} · ${timeStr}`
}
