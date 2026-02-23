import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type TimeFormat = 'military' | '12hr' | 'friendly'

const STORAGE_KEY = 'hmpf-time-format'

function load(): TimeFormat {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as TimeFormat | null
    if (v === 'military' || v === '12hr' || v === 'friendly') return v
  } catch {}
  return '12hr'
}

export const useSettingsStore = defineStore('settings', () => {
  const timeFormat = ref<TimeFormat>(load())

  watch(timeFormat, (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {}
  })

  return { timeFormat }
})
