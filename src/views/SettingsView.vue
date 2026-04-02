<script setup lang="ts">
import { ref } from 'vue'
import { Settings } from 'lucide-vue-next'
import {
  useSettingsStore,
  type TimeFormat,
  type FeedDayExpandMode,
  type FeedDayRowStyle,
  type FeedDayCountDisplay,
} from '@/stores/settingsStore'
import { useGroupsStore } from '@/stores/groupsStore'

const settings = useSettingsStore()
const groupsStore = useGroupsStore()

const newGroupName = ref('')
const addGroupError = ref('')
const editingGroup = ref<string | null>(null)
const renameDraft = ref('')
const renameError = ref('')

function formatGroupLabel(name: string) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
}

function startRename(name: string) {
  editingGroup.value = name
  renameDraft.value = name
  renameError.value = ''
}

function cancelRename() {
  editingGroup.value = null
  renameDraft.value = ''
  renameError.value = ''
}

function saveRename(oldName: string) {
  renameError.value = ''
  const ok = groupsStore.renameGroup(oldName, renameDraft.value)
  if (ok) {
    editingGroup.value = null
    renameDraft.value = ''
  } else {
    renameError.value = 'Invalid name or duplicate.'
  }
}

function confirmRemoveGroup(name: string) {
  if (groupsStore.groups.length <= 1) return
  if (
    !window.confirm(
      `Remove group "${formatGroupLabel(name)}"? Posts in this group will be unassigned.`
    )
  )
    return
  groupsStore.removeGroup(name)
  if (editingGroup.value === name) cancelRename()
}

function handleAddGroup() {
  addGroupError.value = ''
  const ok = groupsStore.addGroup(newGroupName.value)
  if (ok) {
    newGroupName.value = ''
  } else {
    addGroupError.value = 'Enter a unique name.'
  }
}

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

    <div>
      <label class="mb-2 block text-sm font-medium text-slate-400">Groups</label>
      <p class="mb-3 text-xs text-slate-500">
        Assign posts from the feed with a long-press on a card.
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="name in groupsStore.groups"
          :key="name"
          class="ui-block settings-option-block bg-slate-800/60 px-4 py-3"
        >
          <div v-if="editingGroup === name" class="flex flex-col gap-2">
            <input
              v-model="renameDraft"
              type="text"
              class="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/40"
              :aria-invalid="!!renameError"
            />
            <p v-if="renameError" class="text-xs text-red-400">{{ renameError }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900"
                @click="saveRename(name)"
              >
                Save
              </button>
              <button
                type="button"
                class="rounded-lg bg-slate-700/60 px-3 py-1.5 text-sm text-slate-200"
                @click="cancelRename"
              >
                Cancel
              </button>
            </div>
          </div>
          <div v-else class="flex flex-wrap items-center justify-between gap-2">
            <span class="font-medium text-slate-200">{{ formatGroupLabel(name) }}</span>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg bg-slate-700/60 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-600/60"
                @click="startRename(name)"
              >
                Rename
              </button>
              <button
                type="button"
                class="rounded-lg bg-slate-700/60 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-600/60 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="groupsStore.groups.length <= 1"
                :title="
                  groupsStore.groups.length <= 1
                    ? 'Keep at least one group'
                    : 'Remove group'
                "
                @click="confirmRemoveGroup(name)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          v-model="newGroupName"
          type="text"
          placeholder="New group name"
          class="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500/40"
          @keydown.enter.prevent="handleAddGroup"
        />
        <button
          type="button"
          class="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-400"
          @click="handleAddGroup"
        >
          Add group
        </button>
      </div>
      <p v-if="addGroupError" class="mt-2 text-sm text-red-400">{{ addGroupError }}</p>
    </div>
  </section>
</template>
