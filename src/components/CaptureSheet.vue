<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import CaptureInput from './CaptureInput.vue'
import { X } from 'lucide-vue-next'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [content: string]
}>()

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop === 'true') {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-show="show"
        class="fixed inset-0 z-40 flex flex-col justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Add capture"
      >
        <div
          data-backdrop="true"
          class="absolute inset-0 bg-black/50"
          @click="handleBackdropClick"
        />
        <div
          class="relative max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-slate-600 bg-slate-800 pb-[env(safe-area-inset-bottom)]"
        >
          <div class="sticky top-0 z-10 flex justify-end border-b border-slate-600/60 bg-slate-800 p-2">
            <button
              type="button"
              class="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              aria-label="Close"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="p-4">
            <CaptureInput @submit="(c) => emit('submit', c)" @done="emit('close')" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .relative,
.sheet-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}
</style>
