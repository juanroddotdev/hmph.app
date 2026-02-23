import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TagOption } from '@/lib/emojiTags'
import { DEFAULT_TAG_OPTIONS } from '@/lib/emojiTags'

const STORAGE_KEY = 'hmpf-custom-tags'

function load(): TagOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    return parsed.filter(
      (x): x is TagOption =>
        typeof x === 'object' &&
        x !== null &&
        'emoji' in x &&
        'tag' in x &&
        'name' in x
    )
  } catch {
    return []
  }
}

export const useTagOptionsStore = defineStore('tagOptions', () => {
  const customTags = ref<TagOption[]>(load())

  watch(
    customTags,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {}
    },
    { deep: true }
  )

  const tagOptions = computed(() => [...DEFAULT_TAG_OPTIONS, ...customTags.value])

  function getTagName(emoji: string): string {
    const opt = tagOptions.value.find((o) => o.emoji === emoji)
    return opt?.name ?? ''
  }

  function addCustomTag(emoji: string, name: string): boolean {
    const trimmedEmoji = emoji.trim()
    if (!trimmedEmoji) return false
    const baseTag = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const tag = baseTag || `tag-${Date.now().toString(36)}`
    const displayName = name.trim() || tag
    if (customTags.value.some((t) => t.emoji === trimmedEmoji || t.tag === tag)) return false
    customTags.value.push({ emoji: trimmedEmoji, tag, name: displayName })
    return true
  }

  function removeCustomTag(emoji: string) {
    customTags.value = customTags.value.filter((t) => t.emoji !== emoji)
  }

  return { tagOptions, customTags, getTagName, addCustomTag, removeCustomTag }
})
