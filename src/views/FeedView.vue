<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import CaptureTrigger from '@/components/CaptureTrigger.vue'
import CaptureSheet from '@/components/CaptureSheet.vue'
import PostCard from '@/components/PostCard.vue'
import DayPostSquares from '@/components/DayPostSquares.vue'
import { useThoughtStore } from '@/stores/thoughtStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGroupsStore } from '@/stores/groupsStore'
import type { Post } from '@/lib/supabase'
import {
  todayKey,
  groupPostsByLocalDay,
  previousDayEntries,
  formatPastDayLabel,
} from '@/lib/groupPostsByDay'
import { quoteForDay } from '@/lib/dailyQuotes'

const store = useThoughtStore()
const settings = useSettingsStore()
const groupsStore = useGroupsStore()
const showSheet = ref(false)
const selectedGroupFilter = ref<string | null>(null)
const expandedDayKey = ref<string | null>(null)
const expandedOpenDays = ref<string[]>([])
const enableMockWeek = import.meta.env.DEV

watch(
  () => settings.feedDayExpandMode,
  (mode) => {
    if (mode === 'single') {
      if (expandedOpenDays.value.length > 0) {
        expandedDayKey.value = expandedOpenDays.value[0]
      }
      expandedOpenDays.value = []
    } else {
      if (expandedDayKey.value) {
        expandedOpenDays.value = [expandedDayKey.value]
      }
      expandedDayKey.value = null
    }
  }
)

function isoAtLocal(dayOffset: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function mockPost(id: string, dayOffset: number, hour: number, minute: number, content: string): Post {
  return {
    id,
    user_id: 'mock-user',
    content,
    status: 'active',
    is_processed: false,
    visibility: 'private',
    scheduled_for: isoAtLocal(dayOffset, 9, 0),
    created_at: isoAtLocal(dayOffset, hour, minute),
  }
}

const mockWeekPosts: Post[] = [
  mockPost('mock-0-a', 0, 8, 12, 'morning reset: water + inbox zero 📝 #todo'),
  mockPost('mock-0-b', 0, 13, 5, 'quick thought: batch errands after 6pm 🧠 #thoughts'),
  mockPost('mock-0-c', 0, 19, 42, 'ship feed accordion polish 📌 #priority'),
  mockPost('mock-1-a', 1, 9, 20, 'write 3 bullets for weekly review 📝 #todo'),
  mockPost('mock-1-b', 1, 11, 2, 'idea: tag suggestions should be subtle 💡 #idea'),
  mockPost('mock-1-c', 1, 21, 35, 'why do late notes feel clearer? ❓ #question'),
  mockPost('mock-2-a', 2, 7, 48, 'walk first, then coffee 👍'),
  mockPost('mock-2-b', 2, 14, 10, 'goal check: finish capture flow 🎯 #goal'),
  mockPost('mock-2-c', 2, 17, 28, 'small wins still count 😌'),
  mockPost('mock-3-a', 3, 10, 5, 'buy groceries + refill meds 📝 #todo'),
  mockPost('mock-3-b', 3, 16, 37, 'notes feel cleaner with day sections 💡 #idea'),
  mockPost('mock-3-c', 3, 22, 14, 'energy dipped hard after dinner 😮‍💨'),
  mockPost('mock-4-a', 4, 8, 30, 'call plumber tomorrow morning 📝 #todo'),
  mockPost('mock-4-b', 4, 12, 42, 'priority: send invoice before 3pm 📌 #priority'),
  mockPost('mock-4-c', 4, 20, 9, 'solid progress today 🙌'),
  mockPost('mock-5-a', 5, 9, 55, 'question: should review tab show streaks? ❓ #question'),
  mockPost('mock-5-b', 5, 15, 13, 'idea: tiny haptic on successful capture 💡 #idea'),
  mockPost('mock-5-c', 5, 18, 45, 'feeling better after short walk 😊'),
  mockPost('mock-6-a', 6, 7, 25, 'plan week: 2 deep-work blocks per day 🎯 #goal'),
  mockPost('mock-6-b', 6, 13, 0, 'todo: renew license and backup photos 📝 #todo'),
  mockPost('mock-6-c', 6, 23, 5, 'brain dump before sleep 🧠 #thoughts'),
]

const displayFeed = computed(() =>
  enableMockWeek
    ? [...store.feed, ...mockWeekPosts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : store.feed
)

const filteredFeed = computed(() => {
  const posts = displayFeed.value
  const g = selectedGroupFilter.value
  if (g == null) return posts
  return posts.filter((p) => groupsStore.getPostGroup(p.id) === g)
})

function groupFilterPillClass(key: string | null) {
  const active =
    key === null ? selectedGroupFilter.value === null : selectedGroupFilter.value === key
  return [
    'shrink-0 rounded-lg px-3 py-1.5 text-sm capitalize transition',
    active
      ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40'
      : 'bg-slate-900/55 text-slate-300 hover:bg-slate-700/60',
  ]
}

const todayK = computed(() => todayKey())

const grouped = computed(() => groupPostsByLocalDay(filteredFeed.value))

const todaySectionPosts = computed(() => {
  const tk = todayK.value
  const map = grouped.value
  const keys = [...map.keys()].filter((k) => k >= tk).sort()
  const posts = keys.flatMap((k) => map.get(k) ?? [])
  return posts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

const previousDays = computed(() => previousDayEntries(grouped.value, todayK.value))

const todayQuote = computed(() => quoteForDay(todayK.value))

const dayListWrapperClass = computed(() =>
  settings.feedDayRowStyle === 'card' ? 'flex flex-col gap-1' : 'flex flex-col divide-y divide-slate-700/50'
)

function isDayExpanded(dayKey: string): boolean {
  return settings.feedDayExpandMode === 'single'
    ? expandedDayKey.value === dayKey
    : expandedOpenDays.value.includes(dayKey)
}

function toggleDay(dayKey: string) {
  if (settings.feedDayExpandMode === 'single') {
    expandedDayKey.value = expandedDayKey.value === dayKey ? null : dayKey
  } else {
    const i = expandedOpenDays.value.indexOf(dayKey)
    if (i >= 0) {
      expandedOpenDays.value = expandedOpenDays.value.filter((k) => k !== dayKey)
    } else {
      expandedOpenDays.value = [...expandedOpenDays.value, dayKey]
    }
  }
}

function handleSubmit(content: string) {
  store.addPost(content)
}

onMounted(() => {
  store.fetchPosts()
})
</script>

<template>
  <div class="relative flex flex-col gap-6">
    <p v-if="store.error" class="text-sm text-red-400">{{ store.error }}</p>
    <div v-if="store.isLoading && displayFeed.length === 0" class="py-8 text-center text-slate-500">
      Loading...
    </div>
    <div v-else class="flex flex-col gap-6 pb-20">
      <div class="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <button
          type="button"
          :class="groupFilterPillClass(null)"
          @click="selectedGroupFilter = null"
        >
          All
        </button>
        <button
          v-for="name in groupsStore.groups"
          :key="name"
          type="button"
          :class="groupFilterPillClass(name)"
          @click="selectedGroupFilter = name"
        >
          {{ name }}
        </button>
      </div>

      <template
        v-if="selectedGroupFilter && filteredFeed.length === 0 && displayFeed.length > 0"
      >
        <div class="ui-block bg-slate-800/40 px-4 py-8 text-center">
          <p class="mb-2 text-slate-400">
            No posts in "{{ selectedGroupFilter }}".
          </p>
          <p class="text-sm text-slate-500">
            Assign posts with a long-press on a card, or pick another group.
          </p>
        </div>
      </template>

      <template v-else>
      <section>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Today
        </h2>
        <div v-if="todaySectionPosts.length > 0" class="flex flex-col gap-3">
          <PostCard
            v-for="post in todaySectionPosts"
            :key="post.id"
            :post="post"
          />
        </div>
        <div
          v-else
          class="ui-block bg-slate-800/40 px-4 py-8 text-center"
        >
          <template v-if="selectedGroupFilter">
            <p class="mb-2 text-slate-400">No posts in this group today.</p>
            <p class="text-sm text-slate-500">
              Try another filter or assign posts with a long-press.
            </p>
          </template>
          <template v-else>
            <p class="mb-2 text-slate-400">Nothing captured today yet.</p>
            <p class="text-sm italic text-slate-500">{{ todayQuote }}</p>
          </template>
        </div>
      </section>

      <section v-if="previousDays.length > 0">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Earlier
        </h2>
        <div :class="dayListWrapperClass">
          <div v-for="{ dayKey, posts } in previousDays" :key="dayKey" class="flex flex-col">
            <button
              type="button"
              :class="[
                'flex w-full items-center justify-between text-left transition',
                settings.feedDayRowStyle === 'card'
                  ? 'rounded-xl border border-slate-600/60 bg-slate-800/50 px-4 py-3 hover:border-slate-500 hover:bg-slate-800/80'
                  : 'px-1 py-3 hover:bg-slate-800/30',
              ]"
              :aria-expanded="isDayExpanded(dayKey)"
              @click="toggleDay(dayKey)"
            >
              <span class="font-medium text-slate-200">{{ formatPastDayLabel(dayKey) }}</span>
              <span class="flex min-w-0 shrink-0 items-center gap-2 text-sm text-slate-500">
                <DayPostSquares
                  v-if="settings.feedDayCountDisplay === 'squares'"
                  :count="posts.length"
                />
                <span v-else-if="settings.feedDayCountDisplay === 'number'">{{ posts.length }}</span>
                <ChevronDown
                  class="h-5 w-5 shrink-0 transition-transform"
                  :class="isDayExpanded(dayKey) ? 'rotate-180' : ''"
                />
              </span>
            </button>
            <div
              class="overflow-hidden transition-[max-height] duration-300 ease-in-out"
              :class="isDayExpanded(dayKey) ? 'max-h-[3000px]' : 'max-h-0'"
            >
              <div class="flex flex-col gap-3 pl-1 pb-2 pt-1">
                <PostCard v-for="post in posts" :key="post.id" :post="post" />
              </div>
            </div>
          </div>
        </div>
      </section>
      </template>
    </div>

    <div class="fixed bottom-6 right-4 z-30 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      <CaptureTrigger @open="showSheet = true" />
    </div>
    <CaptureSheet :show="showSheet" @close="showSheet = false" @submit="handleSubmit" />
  </div>
</template>
