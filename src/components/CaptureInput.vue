<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore, type TimeFormat } from '@/stores/settingsStore'
import { useTagOptionsStore } from '@/stores/tagOptionsStore'
import { MOOD_EMOJIS } from '@/lib/emojiTags'

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  submit: [content: string]
}>()

const settings = useSettingsStore()
const tagStore = useTagOptionsStore()
const inputRef = ref<HTMLTextAreaElement | null>(null)

const timeOptions: { value: TimeFormat; label: string }[] = [
  { value: '12hr', label: '12hr' },
  { value: 'military', label: '24hr' },
  { value: 'friendly', label: 'Time of day' },
]

const showAddTag = ref(false)
const newTagEmoji = ref('')
const newTagName = ref('')

function addCustomTag() {
  const ok = tagStore.addCustomTag(newTagEmoji.value.trim(), newTagName.value.trim())
  if (ok) {
    newTagEmoji.value = ''
    newTagName.value = ''
    showAddTag.value = false
  }
}
const moodEmojis = [...MOOD_EMOJIS]

function insertAtCursor(text: string) {
  const textarea = inputRef.value
  if (!textarea) {
    model.value = (model.value ?? '') + text
    return
  }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = (model.value ?? '').slice(0, start)
  const after = (model.value ?? '').slice(end)
  model.value = before + text + after
  textarea.focus()
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length
  }, 0)
}

function insertTag(opt: { emoji: string; tag: string; name: string }) {
  insertAtCursor(`${opt.emoji} #${opt.tag} `)
}

function insertEmoji(emoji: string) {
  insertAtCursor(emoji)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    const content = model.value?.trim()
    if (content) {
      emit('submit', content)
      model.value = ''
    }
  }
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="rounded-xl border border-slate-600/60 bg-slate-800/60 p-4 transition">
    <textarea
      ref="inputRef"
      v-model="model"
      class="mb-4 w-full min-h-[3rem] max-h-32 resize-none rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-white placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      placeholder="Type something... Hit Enter to capture."
      rows="1"
      @keydown="handleKeyDown"
    />

    <div class="flex flex-col gap-2 border-t border-slate-600/60 pt-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-slate-500">Time:</span>
        <div class="flex gap-1">
          <button
            v-for="opt in timeOptions"
            :key="opt.value"
            type="button"
            :class="[
              'rounded-lg px-2 py-1 text-xs transition',
              settings.timeFormat === opt.value
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'
            ]"
            @click="settings.timeFormat = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-1">
        <span class="text-xs text-slate-500 self-center">Mood:</span>
        <button
          v-for="emoji in moodEmojis"
          :key="emoji"
          type="button"
          class="rounded-lg p-1.5 text-lg leading-none transition hover:bg-slate-700 hover:scale-110"
          :title="`Insert ${emoji}`"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>

      <div class="flex flex-wrap items-end gap-1">
        <span class="text-xs text-slate-500 self-center">Tags:</span>
        <button
          v-for="opt in tagStore.tagOptions"
          :key="opt.tag + opt.emoji"
          type="button"
          class="flex flex-col items-center rounded-lg p-1.5 transition hover:bg-slate-700"
          :title="`#${opt.tag}`"
          @click="insertTag(opt)"
        >
          <span class="text-lg leading-none">{{ opt.emoji }}</span>
          <span class="text-[10px] leading-tight text-slate-500">{{ opt.name }}</span>
        </button>
        <button
          type="button"
          class="flex h-12 w-10 flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 text-slate-500 transition hover:border-amber-500 hover:text-amber-400"
          title="Add tag"
          @click="showAddTag = true"
        >
          <span class="text-lg">+</span>
        </button>
      </div>

      <!-- Add tag modal -->
      <div
        v-if="showAddTag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="showAddTag = false"
      >
        <div class="w-full max-w-sm rounded-xl border border-slate-600 bg-slate-800 p-4">
          <h3 class="mb-3 font-medium text-slate-200">Add custom tag</h3>
          <div class="space-y-3">
            <input
              v-model="newTagEmoji"
              type="text"
              placeholder="Emoji (paste one)"
              maxlength="4"
              class="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500"
            />
            <input
              v-model="newTagName"
              type="text"
              placeholder="Name (e.g. work)"
              class="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500"
            />
          </div>
          <div class="mt-4 flex gap-2">
            <button
              class="flex-1 rounded-lg bg-amber-500 py-2 text-slate-900"
              @click="addCustomTag"
            >
              Add
            </button>
            <button
              class="rounded-lg border border-slate-600 px-4 py-2 text-slate-400"
              @click="showAddTag = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
