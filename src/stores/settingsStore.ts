import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type TimeFormat = 'military' | '12hr' | 'friendly'
export type FeedDayExpandMode = 'single' | 'multi'
export type FeedDayRowStyle = 'flat' | 'card'
export type FeedDayCountDisplay = 'none' | 'number' | 'squares'
/** Capture tab post rows only (Step 4). */
export type FeedDensity = 'card' | 'compact'

const STORAGE_TIME = 'hmpf-time-format'
const STORAGE_EXPAND = 'hmpf-feed-expand-mode'
const STORAGE_ROW = 'hmpf-feed-day-row-style'
const STORAGE_COUNT = 'hmpf-feed-day-count'
const STORAGE_FEED_DENSITY = 'hmpf-feed-density'

function loadTimeFormat(): TimeFormat {
  try {
    const v = localStorage.getItem(STORAGE_TIME) as TimeFormat | null
    if (v === 'military' || v === '12hr' || v === 'friendly') return v
  } catch {}
  return '12hr'
}

function loadExpandMode(): FeedDayExpandMode {
  try {
    const v = localStorage.getItem(STORAGE_EXPAND) as FeedDayExpandMode | null
    if (v === 'single' || v === 'multi') return v
  } catch {}
  return 'single'
}

function loadRowStyle(): FeedDayRowStyle {
  try {
    const v = localStorage.getItem(STORAGE_ROW) as FeedDayRowStyle | null
    if (v === 'flat' || v === 'card') return v
  } catch {}
  return 'flat'
}

function loadCountDisplay(): FeedDayCountDisplay {
  try {
    const v = localStorage.getItem(STORAGE_COUNT) as FeedDayCountDisplay | null
    if (v === 'none' || v === 'number' || v === 'squares') return v
  } catch {}
  return 'number'
}

function loadFeedDensity(): FeedDensity {
  try {
    const v = localStorage.getItem(STORAGE_FEED_DENSITY) as FeedDensity | null
    if (v === 'card' || v === 'compact') return v
  } catch {}
  return 'card'
}

export const useSettingsStore = defineStore('settings', () => {
  const timeFormat = ref<TimeFormat>(loadTimeFormat())
  const feedDayExpandMode = ref<FeedDayExpandMode>(loadExpandMode())
  const feedDayRowStyle = ref<FeedDayRowStyle>(loadRowStyle())
  const feedDayCountDisplay = ref<FeedDayCountDisplay>(loadCountDisplay())
  const feedDensity = ref<FeedDensity>(loadFeedDensity())

  watch(timeFormat, (v) => {
    try {
      localStorage.setItem(STORAGE_TIME, v)
    } catch {}
  })

  watch(feedDayExpandMode, (v) => {
    try {
      localStorage.setItem(STORAGE_EXPAND, v)
    } catch {}
  })

  watch(feedDayRowStyle, (v) => {
    try {
      localStorage.setItem(STORAGE_ROW, v)
    } catch {}
  })

  watch(feedDayCountDisplay, (v) => {
    try {
      localStorage.setItem(STORAGE_COUNT, v)
    } catch {}
  })

  watch(feedDensity, (v) => {
    try {
      localStorage.setItem(STORAGE_FEED_DENSITY, v)
    } catch {}
  })

  return {
    timeFormat,
    feedDayExpandMode,
    feedDayRowStyle,
    feedDayCountDisplay,
    feedDensity,
  }
})
