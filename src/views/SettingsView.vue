<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import {
  useSettingsStore,
  type TimeFormat,
  type FeedDayExpandMode,
  type FeedDayRowStyle,
  type FeedDayCountDisplay,
} from '@/stores/settingsStore'

const settings = useSettingsStore()

const timeOptions: { value: TimeFormat; label: string }[] = [
  { value: '12hr', label: '12 hr (e.g. 2:30 PM)' },
  { value: 'military', label: '24 hr (e.g. 14:30)' },
  { value: 'friendly', label: 'Time of day (morning / brunch / day / after-work / sleep)' },
]

const expandOptions: { value: FeedDayExpandMode; label: string }[] = [
  { value: 'single', label: 'One day at a time (accordion)' },
  { value: 'multi', label: 'Keep multiple days open' },
]

const rowOptions: { value: FeedDayRowStyle; label: string }[] = [
  { value: 'flat', label: 'Flat (no border)' },
  { value: 'card', label: 'Card (bordered)' },
]

const countOptions: { value: FeedDayCountDisplay; label: string }[] = [
  { value: 'none', label: 'Hidden' },
  { value: 'number', label: 'Number' },
  { value: 'squares', label: 'Squares' },
]
</script>

<template>
  <section class="space-y-6">
    <header class="flex items-center gap-2 text-slate-300">
      <Settings class="h-5 w-5" />
      <h2 class="text-lg font-semibold">Settings</h2>
    </header>

    <div>
      <label class="mb-2 block text-sm font-medium text-slate-400">Time format</label>
      <div class="flex flex-col gap-2">
        <label
          v-for="opt in timeOptions"
          :key="opt.value"
          class="ui-block settings-option-block flex cursor-pointer items-center gap-3 bg-slate-800/60 px-4 py-3 transition hover:border-slate-500"
        >
          <input
            v-model="settings.timeFormat"
            type="radio"
            :value="opt.value"
            class="h-4 w-4 accent-amber-500"
          />
          <span class="text-slate-200">{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-slate-400">Earlier days — expansion</label>
      <div class="flex flex-col gap-2">
        <label
          v-for="opt in expandOptions"
          :key="opt.value"
          class="ui-block settings-option-block flex cursor-pointer items-center gap-3 bg-slate-800/60 px-4 py-3 transition hover:border-slate-500"
        >
          <input
            v-model="settings.feedDayExpandMode"
            type="radio"
            :value="opt.value"
            class="h-4 w-4 accent-amber-500"
          />
          <span class="text-slate-200">{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-slate-400">Earlier days — row style</label>
      <div class="flex flex-col gap-2">
        <label
          v-for="opt in rowOptions"
          :key="opt.value"
          class="ui-block settings-option-block flex cursor-pointer items-center gap-3 bg-slate-800/60 px-4 py-3 transition hover:border-slate-500"
        >
          <input
            v-model="settings.feedDayRowStyle"
            type="radio"
            :value="opt.value"
            class="h-4 w-4 accent-amber-500"
          />
          <span class="text-slate-200">{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-slate-400">Earlier days — post count</label>
      <div class="flex flex-col gap-2">
        <label
          v-for="opt in countOptions"
          :key="opt.value"
          class="ui-block settings-option-block flex cursor-pointer items-center gap-3 bg-slate-800/60 px-4 py-3 transition hover:border-slate-500"
        >
          <input
            v-model="settings.feedDayCountDisplay"
            type="radio"
            :value="opt.value"
            class="h-4 w-4 accent-amber-500"
          />
          <span class="text-slate-200">{{ opt.label }}</span>
        </label>
      </div>
    </div>
  </section>
</template>
