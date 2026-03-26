<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PenLine } from 'lucide-vue-next'

const emit = defineEmits<{
  open: []
}>()

const SWIPE_THRESHOLD = 50
const touchStartX = ref(0)

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  if (dx < -SWIPE_THRESHOLD) {
    emit('open')
  }
}

function handleClick() {
  emit('open')
}
</script>

<template>
  <button
    type="button"
    class="touch-manipulation select-none rounded-full bg-amber-500/90 px-4 py-3 shadow-lg shadow-amber-500/20 transition active:scale-95"
    title="Add capture (tap or swipe left)"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <span class="flex items-center gap-2 text-base font-medium text-slate-900">
      <PenLine class="h-5 w-5" />
      Add
    </span>
  </button>
</template>
