<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { useSettingsStore, type TimeFormat } from '@/stores/settingsStore'

const settings = useSettingsStore()

const options: { value: TimeFormat; label: string }[] = [
  { value: '12hr', label: '12 hr (e.g. 2:30 PM)' },
  { value: 'military', label: '24 hr (e.g. 14:30)' },
  { value: 'friendly', label: 'Time of day (morning / brunch / day / after-work / sleep)' },
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
          v-for="opt in options"
          :key="opt.value"
          class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-600/60 bg-slate-800/60 px-4 py-3 transition hover:border-slate-500"
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
  </section>
</template>
