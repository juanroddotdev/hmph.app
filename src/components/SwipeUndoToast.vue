<script setup lang="ts">
import { computed } from 'vue'
import { useThoughtStore } from '@/stores/thoughtStore'

const store = useThoughtStore()

const message = computed(() => {
  const u = store.feedUndo
  if (!u) return ''
  return u.kind === 'done' ? 'Marked done' : 'Moved to next week'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="store.feedUndo"
        class="fixed bottom-20 left-1/2 z-[100] flex max-w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-xl border border-slate-600/60 bg-slate-900/95 px-4 py-3 text-sm text-slate-200 shadow-lg backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        role="status"
      >
        <span class="min-w-0 flex-1">{{ message }}</span>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 font-medium text-amber-400 transition hover:bg-amber-500/30"
          @click="store.undoFeedAction()"
        >
          Undo
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          aria-label="Dismiss"
          @click="store.dismissFeedUndo()"
        >
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
