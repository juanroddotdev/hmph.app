<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { useFeedPostSwipe } from '@/composables/useFeedPostSwipe'
import { Check, CalendarDays } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    post: Post
    showActions?: boolean
    /** Feed-only: swipe Done/Push + ghost control (Step 3). */
    enableFeedSwipe?: boolean
  }>(),
  { enableFeedSwipe: false }
)

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

/** Done cards: tap toggles expanded (full size + Done pill) vs collapsed (receded). */
const doneExpanded = ref(false)

watch(
  () => props.post.status,
  (s) => {
    if (s !== 'done') doneExpanded.value = false
  }
)

const { start: startLongPress, stop: stopLongPress, cancel: cancelLongPress } = useLongPress(
  () => {
    if (cardState.value === 'normal') cardState.value = 'menu'
  },
  {
    duration: 400,
    onShortPress() {
      if (cardState.value !== 'normal') return
      if (props.post.status === 'done') {
        doneExpanded.value = !doneExpanded.value
      }
    },
  }
)

const swipeSurfaceRef = ref<HTMLElement | null>(null)

const swipe = useFeedPostSwipe({
  enabled: () => props.enableFeedSwipe && cardState.value === 'normal',
  post: () => props.post,
  swipeMode: () => {
    const p = props.post
    if (p.status === 'done') return 'done'
    if (p.is_processed) return 'pushed'
    return 'unprocessed'
  },
  cancelLongPress: cancelLongPress,
  onCommitDone: async () => {
    await thoughtStore.markAsDone(props.post.id)
  },
  onCommitPush: async () => {
    await thoughtStore.pushToNextWeek(props.post.id)
  },
  swipeSurfaceRef,
})

watch(cardState, (s) => {
  if (s !== 'normal') swipe.resetPosition()
})

const articleSwipeStyle = computed(() => {
  if (!props.enableFeedSwipe || cardState.value !== 'normal') return {}
  return swipe.trackStyle.value
})

const swipeShellClass = computed(() =>
  props.enableFeedSwipe ? 'relative overflow-hidden rounded-xl' : 'contents'
)

const showSwipePeek = computed(
  () => props.enableFeedSwipe && cardState.value === 'normal'
)

function onArticlePointerDown(e: PointerEvent) {
  if (cardState.value === 'normal') {
    startLongPress()
  }
  swipe.onPointerDown(e)
}

async function onArticlePointerUp(e: PointerEvent) {
  await swipe.onPointerUp(e)
  stopLongPress()
}

function onArticlePointerMove(e: PointerEvent) {
  swipe.onPointerMove(e)
}

function onArticlePointerLeave(e: PointerEvent) {
  stopLongPress()
  swipe.onPointerCancel(e)
}

function onArticlePointerCancel(e: PointerEvent) {
  cancelLongPress()
  swipe.onPointerCancel(e)
}

async function ghostMarkDone() {
  await thoughtStore.markAsDone(props.post.id)
}

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

/** Decorative cluster: tag emojis then moods, stacked top-right */
const decorativeEmojis = computed(() => [
  ...tagData.value.map((t) => t.emoji),
  ...moodEmojis.value,
])

const renderedContent = computed(() => {
  const content = stripTagAndMoodForDisplay(props.post.content, tagStore.tagOptions)
  return content.replace(
    /#[\w\u0080-\uFFFF]+/g,
    '<span class="text-amber-400 font-medium">$&</span>'
  )
})

const displayTime = computed(() =>
  formatPostTime(props.post.created_at, settings.timeFormat, { omitDate: true })
)

const isDoneCollapsed = computed(
  () => props.post.status === 'done' && !doneExpanded.value
)

/** Open loop: not done, not yet processed this week. */
const isUnprocessedOpen = computed(
  () => props.post.status !== 'done' && !props.post.is_processed
)

/** Pushed / processed but still active — calmer than open, distinct from done. */
const isPushedLater = computed(
  () => props.post.is_processed && props.post.status !== 'done'
)

/** Normal shell: padding + subtle background by state (Step 2). */
const normalShellClass = computed(() => {
  const p = props.post
  const pad = isDoneCollapsed.value ? 'px-2 py-2' : 'px-3 py-3'
  const base = `relative ${pad} transition-[padding] duration-300`

  if (p.status === 'done') {
    return base
  }
  if (isUnprocessedOpen.value) {
    return `${base} rounded-lg bg-amber-500/[0.07]`
  }
  if (isPushedLater.value) {
    return `${base} rounded-lg bg-slate-900/30`
  }
  return base
})

const bodyTextClass = computed(() => {
  const base =
    'relative z-[1] whitespace-pre-wrap pr-10 transition-all duration-300 '

  if (props.post.status === 'done' && isDoneCollapsed.value) {
    return `${base} text-sm text-slate-300/90 opacity-[0.65] grayscale`
  }
  if (props.post.status === 'done' && doneExpanded.value) {
    return `${base} text-base text-slate-100`
  }
  if (isUnprocessedOpen.value) {
    return `${base} text-base text-slate-50`
  }
  if (isPushedLater.value) {
    return `${base} text-base text-slate-300`
  }
  return `${base} text-base text-slate-100`
})

const decorativeEmojiClass = computed(() =>
  [
    'pointer-events-none absolute right-2 top-2 z-0 flex flex-col items-center text-lg leading-none transition-opacity duration-300',
    isDoneCollapsed.value ? 'opacity-[0.12]' : 'opacity-[0.22]',
  ].join(' ')
)
</script>

<template>
  <div :class="swipeShellClass">
    <div
      v-if="showSwipePeek"
      class="pointer-events-none absolute inset-0 z-0 flex overflow-hidden rounded-xl"
      aria-hidden="true"
    >
      <div
        class="flex w-[42%] min-w-[3.25rem] items-center bg-gradient-to-r from-emerald-950/70 to-emerald-950/20 pl-1.5"
      >
        <Check class="h-7 w-7 text-emerald-400/90" :stroke-width="1.75" />
      </div>
      <div class="min-w-0 flex-1" />
      <div
        class="flex w-[42%] min-w-[3.25rem] items-center justify-end bg-gradient-to-l from-amber-950/65 to-amber-950/20 pr-1.5"
      >
        <CalendarDays class="h-6 w-6 text-amber-400/85" :stroke-width="1.5" />
      </div>
    </div>

    <article
      ref="swipeSurfaceRef"
      class="ui-block post-block relative z-10 overflow-hidden bg-slate-800/60 transition-colors duration-300 hover:bg-slate-800/75"
      :class="{
        'scale-[1.02] bg-slate-800/80 shadow-lg shadow-slate-900/50':
          cardState === 'menu' || cardState === 'groupPicker' || cardState === 'editing',
      }"
      :style="articleSwipeStyle"
      :aria-expanded="post.status === 'done' ? doneExpanded : undefined"
      @pointerdown="onArticlePointerDown"
      @pointermove="onArticlePointerMove"
      @pointerup="onArticlePointerUp"
      @pointerleave="onArticlePointerLeave"
      @pointercancel="onArticlePointerCancel"
    >
      <!-- Normal view: Step 2 + Step 3 ghost (feed, unprocessed only) -->
      <div v-if="cardState === 'normal'" :class="normalShellClass">
        <div class="flex gap-1">
          <button
            v-if="enableFeedSwipe && isUnprocessedOpen"
            type="button"
            class="ghost-done-btn relative z-[2] mt-0.5 flex h-11 w-10 shrink-0 flex-col items-center justify-start border-0 bg-transparent p-0 text-slate-500/70 outline-none transition hover:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-500/40"
            aria-label="Mark done"
            @pointerdown.stop
            @pointerup.stop
            @click.stop="ghostMarkDone"
          >
            <svg
              class="h-9 w-9 shrink-0"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M11.2 20.1c.8-2.1 2.4-4.2 4.9-5.1 2.1-.7 4.4-.4 6.2.9 1.9 1.4 3.1 3.6 3.4 5.9.2 1.8-.1 3.7-1.1 5.2-.9 1.3-2.3 2.2-3.8 2.6-1.9.5-4 .2-5.6-.9-1.8-1.2-2.9-3.2-3.2-5.3"
                stroke="currentColor"
                stroke-width="1.15"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.85"
              />
            </svg>
            <span
              class="font-['Caveat',cursive] text-[0.7rem] leading-none tracking-wide text-slate-500/80"
            >
              ok
            </span>
          </button>
          <div class="min-w-0 flex-1">
            <div
              v-if="decorativeEmojis.length"
              :class="decorativeEmojiClass"
              aria-hidden="true"
            >
              <span
                v-for="(emoji, i) in decorativeEmojis"
                :key="`${emoji}-${i}`"
                class="block first:mt-0"
                :class="i > 0 ? '-mt-2.5' : ''"
              >
                {{ emoji }}
              </span>
            </div>
            <p :class="bodyTextClass" v-html="renderedContent" />
            <footer
              class="relative z-[1] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-400"
            >
              <time :datetime="post.created_at">{{ displayTime }}</time>
              <span
                v-if="isPushedLater"
                class="text-slate-600"
                title="Processed for this week; may return next review"
              >
                · Later
              </span>
              <span
                v-if="groupsStore.getPostGroup(post.id)"
                class="rounded bg-slate-700/60 px-2 py-0.5 text-slate-500"
              >
                {{ groupsStore.getPostGroup(post.id) }}
              </span>
              <span
                v-if="post.status === 'done' && doneExpanded"
                class="rounded bg-emerald-900/50 px-2 py-0.5 text-emerald-400"
              >
                Done
              </span>
              <span v-if="showActions && !post.is_processed" class="ml-auto flex shrink-0 gap-2">
                <button
                  type="button"
                  class="rounded bg-emerald-600/20 px-2 py-1 text-emerald-400 hover:bg-emerald-600/30"
                  @pointerdown.stop
                  @pointerup.stop
                  @click.stop="emit('done')"
                >
                  Done
                </button>
                <button
                  type="button"
                  class="rounded bg-amber-600/20 px-2 py-1 text-amber-400 hover:bg-amber-600/30"
                  @pointerdown.stop
                  @pointerup.stop
                  @click.stop="emit('push')"
                >
                  Push
                </button>
              </span>
            </footer>
          </div>
        </div>
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
          class="rounded-xl bg-slate-800/60 py-3 font-medium text-slate-200 transition hover:bg-slate-700/60"
          @click="assignToGroup(group)"
        >
          {{ group }}
        </button>
        <div v-if="showAddGroup" class="flex gap-2">
          <input
            v-model="newGroupName"
            type="text"
            placeholder="New group name"
            class="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/40"
            @keyup.enter="addGroupAndAssign"
          />
          <button
            class="rounded-xl bg-amber-500/20 px-4 py-2 font-medium text-amber-400"
            @click="addGroupAndAssign"
          >
            Add
          </button>
          <button
            class="rounded-xl bg-slate-700/50 px-4 py-2 text-slate-400 transition hover:bg-slate-700/70"
            @click="showAddGroup = false; newGroupName = ''"
          >
            Cancel
          </button>
        </div>
        <button
          v-else
          class="rounded-xl bg-slate-800/40 py-3 text-slate-500 transition hover:bg-slate-800/70 hover:text-amber-400"
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
        class="min-h-[4rem] w-full resize-none rounded-lg bg-slate-900/80 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 focus:ring-amber-500/50"
        placeholder="Edit your thought..."
        rows="3"
      />

      <div class="flex flex-col gap-2 rounded-lg bg-slate-900/40 px-2 py-3">
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
          class="rounded-xl bg-slate-700/50 px-4 py-3 text-slate-400 transition hover:bg-slate-700/70 hover:text-slate-300"
          @click="cancelEdit"
        >
          Cancel
        </button>
      </div>
    </div>
  </article>
  </div>
</template>
