<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useGroupsStore } from '@/stores/groupsStore'
import { useSlideNavStore } from '@/stores/slideNavStore'

const groupsStore = useGroupsStore()
const navStore = useSlideNavStore()

const newGroupName = ref('')
const showAddGroup = ref(false)

function addGroup() {
  const ok = groupsStore.addGroup(newGroupName.value)
  if (ok) {
    newGroupName.value = ''
    showAddGroup.value = false
  }
}

</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="navStore.isOpen"
      class="fixed inset-0 z-40 bg-black/40 transition"
      @click="navStore.close()"
    />

    <!-- Slide panel -->
    <aside
      class="fixed right-0 top-0 z-50 h-full w-72 transform border-l border-slate-700 bg-slate-900 shadow-xl transition-transform duration-300"
      :class="navStore.isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex h-full flex-col p-4">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-slate-200">Groups</h2>
          <button
            class="rounded p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
            @click="navStore.close()"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex-1 space-y-2 overflow-y-auto">
          <div
            v-for="group in groupsStore.groups"
            :key="group"
            :data-group="group"
            class="rounded-xl border-2 border-dashed transition"
            :class="[
              navStore.hoveredGroup === group
                ? 'border-amber-500/60 bg-amber-500/10'
                : 'border-slate-600/60 bg-slate-800/40 hover:border-slate-500',
            ]"
          >
            <div class="px-4 py-3 text-slate-200">
              {{ group }}
            </div>
            <p class="px-4 pb-2 text-xs text-slate-500">
              Drop card here
            </p>
          </div>

          <div v-if="showAddGroup" class="rounded-xl border border-slate-600 bg-slate-800/60 p-3">
            <input
              v-model="newGroupName"
              type="text"
              placeholder="Group name"
              class="mb-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-200"
              @keyup.enter="addGroup"
            />
            <div class="flex gap-2">
              <button
                class="rounded-lg bg-amber-500/20 px-3 py-1 text-sm text-amber-400"
                @click="addGroup"
              >
                Add
              </button>
              <button
                class="rounded-lg px-3 py-1 text-sm text-slate-400"
                @click="showAddGroup = false; newGroupName = ''"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="!showAddGroup"
          class="mt-4 rounded-xl border border-dashed border-slate-600 py-3 text-sm text-slate-500 transition hover:border-amber-500/50 hover:text-amber-400"
          @click="showAddGroup = true"
        >
          + New group
        </button>
      </div>
    </aside>
  </Teleport>
</template>
