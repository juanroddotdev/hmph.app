<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useTagOptionsStore } from '@/stores/tagOptionsStore'
import { MOOD_EMOJIS, resolveShortcuts } from '@/lib/emojiTags'

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  submit: [content: string]
  done: []
}>()

const tagStore = useTagOptionsStore()
const inputRef = ref<HTMLTextAreaElement | null>(null)

const showMoodPicker = ref(false)
const showTagPicker = ref(false)
const showAllMoods = ref(false)

const selectedMood = ref<string | null>(null)
const selectedTag = ref<{ emoji: string; tag: string; name: string } | null>(null)

const showAddTag = ref(false)
const newTagEmoji = ref('')
const newTagName = ref('')
const addTagButtonRef = ref<HTMLButtonElement | null>(null)
const addTagPopoverRef = ref<HTMLDivElement | null>(null)
const addTagNameRef = ref<HTMLInputElement | null>(null)

const moodEmojis = [...MOOD_EMOJIS]
const quickMoodEmojis = computed(() => moodEmojis.slice(0, 6))

function openMoodPicker() {
  showMoodPicker.value = !showMoodPicker.value
  if (showMoodPicker.value) showTagPicker.value = false
}

function openTagPicker() {
  showTagPicker.value = !showTagPicker.value
  if (showTagPicker.value) showMoodPicker.value = false
}

function addCustomTag() {
  const ok = tagStore.addCustomTag(newTagEmoji.value.trim(), newTagName.value.trim())
  if (ok) {
    newTagEmoji.value = ''
    newTagName.value = ''
    showAddTag.value = false
  }
}

function toggleAddTagPopover() {
  showAddTag.value = !showAddTag.value
  if (showAddTag.value) {
    nextTick(() => addTagNameRef.value?.focus())
  }
}

function closeAddTagPopover() {
  showAddTag.value = false
}

function handlePointerDownOutside(event: PointerEvent) {
  if (!showAddTag.value) return
  const target = event.target as Node
  const inPopover = addTagPopoverRef.value?.contains(target)
  const inButton = addTagButtonRef.value?.contains(target)
  if (!inPopover && !inButton) {
    showAddTag.value = false
  }
}

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
  selectedTag.value = opt
  insertAtCursor(`${opt.emoji} #${opt.tag} `)
  showTagPicker.value = false
}

function insertEmoji(emoji: string) {
  selectedMood.value = emoji
  insertAtCursor(emoji)
  showMoodPicker.value = false
}

function autoGrow() {
  const textarea = inputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}

function resetHeight() {
  const textarea = inputRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
}

function submitCapture(): boolean {
  const raw = model.value?.trim()
  if (!raw) return false
  const content = resolveShortcuts(raw, tagStore.tagOptions)
  emit('submit', content)
  model.value = ''
  selectedMood.value = null
  selectedTag.value = null
  showMoodPicker.value = false
  showTagPicker.value = false
  nextTick(resetHeight)
  return true
}

function handleCaptureTap() {
  if (submitCapture()) emit('done')
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault()
    submitCapture()
    return
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (submitCapture()) emit('done')
  }
}

onMounted(() => {
  inputRef.value?.focus()
  document.addEventListener('pointerdown', handlePointerDownOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerDownOutside)
})
</script>

<template>
  <div id="capture-composer" class="capture-block rounded-xl bg-slate-800/55 p-3 transition sm:p-4">
    <textarea
      ref="inputRef"
      v-model="model"
      class="mb-2 w-full min-h-[3rem] max-h-[200px] overflow-y-auto rounded-lg bg-slate-900/55 px-4 py-3 text-base text-white placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-amber-500/50"
      placeholder="Type something... Hit Enter to capture."
      rows="1"
      @input="autoGrow"
      @keydown="handleKeyDown"
    />

    <div class="flex items-center justify-between gap-2 pt-1.5">
      <div class="flex items-center gap-2">
        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-1.5 text-sm transition',
            showMoodPicker
              ? 'bg-amber-500/15 text-amber-300'
              : 'bg-slate-900/55 text-slate-300 hover:bg-slate-700/60'
          ]"
          @click="openMoodPicker"
        >
          Mood
        </button>
        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-1.5 text-sm transition',
            showTagPicker
              ? 'bg-amber-500/15 text-amber-300'
              : 'bg-slate-900/55 text-slate-300 hover:bg-slate-700/60'
          ]"
          @click="openTagPicker"
        >
          Category
        </button>
      </div>
      <button
        type="button"
        class="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-amber-400 active:scale-[0.98]"
        @click="handleCaptureTap"
      >
        Capture
      </button>
    </div>

    <div v-if="selectedMood || selectedTag" class="mt-2 flex flex-wrap gap-1.5 text-xs">
      <span
        v-if="selectedMood"
        class="rounded-full bg-slate-700/40 px-2 py-1 text-slate-300"
      >
        {{ selectedMood }} mood
      </span>
      <span
        v-if="selectedTag"
        class="rounded-full bg-slate-700/40 px-2 py-1 text-slate-300"
      >
        {{ selectedTag?.emoji }} #{{ selectedTag?.tag }}
      </span>
    </div>

    <div v-if="showMoodPicker" class="mt-2 rounded-lg bg-slate-900/60 p-2">
      <p class="mb-1 px-1 text-[11px] uppercase tracking-wide text-slate-500">Pick a mood</p>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="emoji in (showAllMoods ? moodEmojis : quickMoodEmojis)"
          :key="emoji"
          type="button"
          class="rounded-lg p-1.5 text-lg leading-none transition hover:bg-slate-700 hover:scale-110"
          :title="`Insert ${emoji}`"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
          @click="showAllMoods = !showAllMoods"
        >
          {{ showAllMoods ? 'Less' : 'More' }}
        </button>
      </div>
    </div>

    <div v-if="showTagPicker" class="mt-2 rounded-lg bg-slate-900/60 p-2">
      <p class="mb-1 px-1 text-[11px] uppercase tracking-wide text-slate-500">Pick a category</p>
      <div class="relative flex flex-wrap items-end gap-1">
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
          ref="addTagButtonRef"
          type="button"
          class="flex h-12 w-10 flex-col items-center justify-center rounded-lg bg-slate-800/70 text-slate-400 transition hover:bg-slate-700 hover:text-amber-300"
          title="Add category"
          @click="toggleAddTagPopover"
        >
          <span class="text-lg">+</span>
        </button>

        <button
          v-if="showAddTag"
          type="button"
          aria-label="Close add category popover"
          class="fixed inset-0 z-10 bg-black/40 backdrop-blur-[1px]"
          @click="closeAddTagPopover"
        />

        <Transition name="add-tag-popover">
          <div
            v-if="showAddTag"
            ref="addTagPopoverRef"
            class="absolute right-0 bottom-14 z-20 w-[min(18rem,calc(100vw-4rem))] rounded-lg bg-slate-800 p-3 shadow-xl shadow-black/40 origin-bottom-right"
          >
            <p class="mb-2 text-xs uppercase tracking-wide text-slate-500">New category</p>
            <div class="space-y-2">
              <input
                v-model="newTagEmoji"
                type="text"
                placeholder="Emoji"
                maxlength="4"
                class="w-full rounded-lg bg-slate-900/70 px-3 py-2 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <input
                ref="addTagNameRef"
                v-model="newTagName"
                type="text"
                placeholder="Name (e.g. work)"
                class="w-full rounded-lg bg-slate-900/70 px-3 py-2 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div class="mt-3 flex justify-end gap-2">
              <button
                class="rounded-lg bg-slate-700/60 px-3 py-1.5 text-sm text-slate-200"
                @click="closeAddTagPopover"
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900"
                @click="addCustomTag"
              >
                Add
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-tag-popover-enter-active,
.add-tag-popover-leave-active {
  transition: transform 0.16s ease, opacity 0.16s ease;
}
.add-tag-popover-enter-from,
.add-tag-popover-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}
</style>
