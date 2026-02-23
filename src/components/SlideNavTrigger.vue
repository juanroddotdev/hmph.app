<script setup lang="ts">
import { Tag } from 'lucide-vue-next'
import { useSlideNavStore } from '@/stores/slideNavStore'

const navStore = useSlideNavStore()
</script>

<template>
  <button
    v-show="!navStore.isOpen"
    class="fixed right-2 top-1/2 z-30 -translate-y-1/2 rounded-l-lg border border-r-0 border-slate-600/60 bg-slate-800/80 px-2 py-3 text-slate-500 shadow transition hover:border-amber-500/50 hover:bg-slate-700 hover:text-amber-400"
    title="Groups"
    @click="navStore.toggle()"
  >
    <Tag class="h-5 w-5" />
  </button>
</template>
