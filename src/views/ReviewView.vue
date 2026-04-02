<script setup lang="ts">
import { onMounted } from 'vue'
import WeeklyReview from '@/components/WeeklyReview.vue'
import { useThoughtStore } from '@/stores/thoughtStore'

const store = useThoughtStore()

onMounted(() => {
  store.fetchPosts()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="store.isLoading" class="py-8 text-center text-slate-500">
      Loading…
    </div>
    <WeeklyReview v-else />
  </div>
</template>
