<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Post } from '@/lib/supabase'
import { useSettingsStore, type TimeFormat } from '@/stores/settingsStore'
import { useThoughtStore } from '@/stores/thoughtStore'
import { formatPostTime } from '@/lib/formatTime'
import {
  parseTagEmojis,
  parseMoodEmojis,
  stripTagAndMoodForDisplay,
  MOOD_EMOJIS,
} from '@/lib/emojiTags'
import { useTagOptionsStore } from '@/stores/tagOptionsStore'
import { useGroupsStore } from '@/stores/groupsStore'
import { useLongPress } from '@/composables/useLongPress'

const props = defineProps<{
  post: Post
  showActions?: boolean
}>()

const emit = defineEmits<{
  done: []
  push: []
}>()

const settings = useSettingsStore()
const thoughtStore = useThoughtStore()
const tagStore = useTagOptionsStore()
const groupsStore = useGroupsStore()

type CardState = 'normal' | 'menu' | 'groupPicker' | 'editing'
const cardState = ref<CardState>('normal')

const editContent = ref('')
const newGroupName = ref('')
const showAddGroup = ref(false)

const { start: startLongPress, stop: stopLongPress, cancel: cancelLongPress } = useLongPress(
  () => {
    if (cardState.value === 'normal') cardState.value = 'menu'
  },
  { duration: 400 }
)

function assignToGroup(groupName: string) {
  groupsStore.assignPostToGroup(props.post.id, groupName)
  cardState.value = 'normal'
}

function openGroupPicker() {
  cardState.value = 'groupPicker'
  showAddGroup.value = false
  newGroupName.value = ''
}

function addGroupAndAssign() {
  const name = newGroupName.value.trim().toLowerCase()
  if (!name) return
  const ok = groupsStore.addGroup(name)
  if (ok) {
    groupsStore.assignPostToGroup(props.post.id, name)
    cardState.value = 'normal'
  }
}

function openEdit() {
  editContent.value = props.post.content
  cardState.value = 'editing'
}

function cancelEdit() {
  cardState.value = 'normal'
}

function closeMenu() {
  cardState.value = 'normal'
}

function backFromGroupPicker() {
  cardState.value = 'menu'
}

async function saveEdit() {
  const trimmed = editContent.value.trim()
  if (!trimmed) return
  const ok = await thoughtStore.updatePost(props.post.id, trimmed)
  if (ok) cardState.value = 'normal'
}

async function handleDelete() {
  const ok = await thoughtStore.deletePost(props.post.id)
  if (ok) cardState.value = 'normal'
}

const editTextareaRef = ref<HTMLTextAreaElement | null>(null)

function insertAtCursor(text: string) {
  const textarea = editTextareaRef.value
  if (!textarea) {
    editContent.value += text
    return
  }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = editContent.value.slice(0, start)
  const after = editContent.value.slice(end)
  editContent.value = before + text + after
  textarea.focus()
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length
  }, 0)
}

function insertTag(opt: { emoji: string; tag: string; name?: string }) {
  insertAtCursor(`${opt.emoji} #${opt.tag} `)
}

const tagData = computed(() => {
  const emojis = parseTagEmojis(props.post.content, tagStore.tagOptions)
  return emojis.map((emoji) => ({ emoji, name: tagStore.getTagName(emoji) }))
})
const moodEmojis = computed(() => parseMoodEmojis(props.post.content))

const renderedContent = computed(() => {
  const content = stripTagAndMoodForDisplay(props.post.content, tagStore.tagOptions)
  return content.replace(
    /#[\w\u0080-\uFFFF]+/g,
    '<span class="text-amber-400 font-medium">$&</span>'
  )
})

const displayTime = computed(() =>
  formatPostTime(props.post.created_at, settings.timeFormat)
)
</script>

<template>
  <article
    class="relative overflow-hidden rounded-xl border border-slate-600/60 bg-slate-800/60 transition-all duration-300 hover:border-slate-500"
    :class="{
      'scale-[1.02] shadow-lg shadow-slate-900/50 ring-2 ring-amber-500/30':
        cardState === 'menu' || cardState === 'groupPicker' || cardState === 'editing',
    }"
    @pointerdown="startLongPress"
    @pointerup="stopLongPress"
    @pointerleave="stopLongPress"
    @pointercancel="cancelLongPress"
  >
    <!-- Normal view -->
    <div v-if="cardState === 'normal'" class="relative p-4">
      <!-- Tag emojis: subtle, behind opaque layer -->
      <div
        v-if="tagData.length"
        class="pointer-events-none absolute top-3 right-3 flex gap-1 text-base opacity-25"
      >
        <span v-for="t in tagData" :key="t.emoji">{{ t.emoji }}</span>
      </div>
      <!-- Mood emojis: subtle, behind opaque layer -->
      <div
        v-if="moodEmojis.length"
        class="pointer-events-none absolute bottom-3 right-3 flex gap-1 text-base opacity-25"
      >
        <span v-for="emoji in moodEmojis" :key="emoji">{{ emoji }}</span>
      </div>
      <p
        class="relative whitespace-pre-wrap text-slate-100"
        v-html="renderedContent"
      />
      <footer class="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <time :datetime="post.created_at">{{ displayTime }}</time>
        <span
          v-if="groupsStore.getPostGroup(post.id)"
          class="rounded bg-slate-700/60 px-2 py-0.5 text-slate-500"
        >
          {{ groupsStore.getPostGroup(post.id) }}
        </span>
        <span
          v-if="post.status === 'done'"
          class="rounded bg-emerald-900/50 px-2 py-0.5 text-emerald-400"
        >
          Done
        </span>
        <span v-if="showActions && !post.is_processed" class="ml-auto flex gap-2">
          <button
            class="rounded bg-emerald-600/20 px-2 py-1 text-emerald-400 hover:bg-emerald-600/30"
            @click.stop="emit('done')"
          >
            Done
          </button>
          <button
            class="rounded bg-amber-600/20 px-2 py-1 text-amber-400 hover:bg-amber-600/30"
            @click.stop="emit('push')"
          >
            Push
          </button>
        </span>
      </footer>
    </div>

    <!-- Menu view: Edit | Delete | Group -->
    <div
      v-else-if="cardState === 'menu'"
      class="flex flex-col gap-4 p-6"
    >
      <p class="whitespace-pre-wrap text-slate-100" v-html="renderedContent" />
      <div class="flex flex-col gap-2">
        <button
          class="rounded-xl bg-amber-500/20 py-3 font-medium text-amber-400 transition hover:bg-amber-500/30"
          @click="openEdit"
        >
          Edit
        </button>
        <button
          class="rounded-xl bg-red-900/30 py-3 font-medium text-red-400 transition hover:bg-red-900/50"
          @click="handleDelete"
        >
          Delete
        </button>
        <button
          class="rounded-xl bg-slate-700/60 py-3 font-medium text-slate-300 transition hover:bg-slate-600/60"
          @click="openGroupPicker"
        >
          Group
        </button>
      </div>
      <button
        class="text-sm text-slate-500 hover:text-slate-300"
        @click="closeMenu"
      >
        Cancel
      </button>
    </div>

    <!-- Group picker: choose group -->
    <div
      v-else-if="cardState === 'groupPicker'"
      class="flex flex-col gap-4 p-6"
    >
      <p class="whitespace-pre-wrap text-slate-100" v-html="renderedContent" />
      <p class="text-sm text-slate-500">Assign to group:</p>
      <div class="flex flex-col gap-2">
        <button
          v-for="group in groupsStore.groups"
          :key="group"
          class="rounded-xl border border-slate-600 bg-slate-800/60 py-3 font-medium text-slate-200 transition hover:border-amber-500/50 hover:bg-slate-700/60"
          @click="assignToGroup(group)"
        >
          {{ group }}
        </button>
        <div v-if="showAddGroup" class="flex gap-2">
          <input
            v-model="newGroupName"
            type="text"
            placeholder="New group name"
            class="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200"
            @keyup.enter="addGroupAndAssign"
          />
          <button
            class="rounded-xl bg-amber-500/20 px-4 py-2 font-medium text-amber-400"
            @click="addGroupAndAssign"
          >
            Add
          </button>
          <button
            class="rounded-xl border border-slate-600 px-4 py-2 text-slate-400"
            @click="showAddGroup = false; newGroupName = ''"
          >
            Cancel
          </button>
        </div>
        <button
          v-else
          class="rounded-xl border border-dashed border-slate-600 py-3 text-slate-500 transition hover:border-amber-500/50 hover:text-amber-400"
          @click="showAddGroup = true"
        >
          + New group
        </button>
      </div>
      <button
        class="text-sm text-slate-500 hover:text-slate-300"
        @click="backFromGroupPicker"
      >
        Back
      </button>
    </div>

    <!-- Edit view: full form -->
    <div v-else-if="cardState === 'editing'" class="flex flex-col gap-4 p-6">
      <textarea
        ref="editTextareaRef"
        v-model="editContent"
        class="min-h-[4rem] w-full resize-none rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        placeholder="Edit your thought..."
        rows="3"
      />

      <div class="flex flex-col gap-2 border-t border-slate-600/60 pt-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-500">Time:</span>
          <div class="flex gap-1">
            <button
              v-for="opt in [
                { value: '12hr' as TimeFormat, label: '12hr' },
                { value: 'military' as TimeFormat, label: '24hr' },
                { value: 'friendly' as TimeFormat, label: 'Time of day' },
              ]"
              :key="opt.value"
              type="button"
              :class="[
                'rounded-lg px-2 py-1 text-xs transition',
                settings.timeFormat === opt.value
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300',
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
            v-for="emoji in MOOD_EMOJIS"
            :key="emoji"
            type="button"
            class="rounded-lg p-1.5 text-lg leading-none transition hover:bg-slate-700"
            @click="insertAtCursor(emoji)"
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
            @click="insertTag(opt)"
          >
            <span class="text-lg leading-none">{{ opt.emoji }}</span>
            <span class="text-[10px] leading-tight text-slate-500">{{ opt.name }}</span>
          </button>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 rounded-xl bg-amber-500 py-3 font-medium text-slate-900 transition hover:bg-amber-400"
          @click="saveEdit"
        >
          Save
        </button>
        <button
          class="rounded-xl border border-slate-600 px-4 py-3 text-slate-400 transition hover:border-slate-500 hover:text-slate-300"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </div>
  </article>
</template>
