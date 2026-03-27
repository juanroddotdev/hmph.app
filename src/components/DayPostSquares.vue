<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    count: number
    max?: number
  }>(),
  { max: 8 }
)

const filled = computed(() => Math.min(props.count, props.max))
const overflow = computed(() => props.count > props.max)
</script>

<template>
  <div class="flex items-center gap-0.5" aria-hidden="true">
    <span
      v-for="i in filled"
      :key="i"
      class="inline-block h-2 w-2 rounded-sm bg-amber-500/75"
    />
    <span v-if="overflow" class="text-[10px] leading-none text-slate-500">+</span>
  </div>
</template>
