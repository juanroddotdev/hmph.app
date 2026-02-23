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
    <WeeklyReview />
  </div>
</template>
