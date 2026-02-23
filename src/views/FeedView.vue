<script setup lang="ts">
import { onMounted } from 'vue'
import CaptureInput from '@/components/CaptureInput.vue'
import PostCard from '@/components/PostCard.vue'
import { useThoughtStore } from '@/stores/thoughtStore'

const store = useThoughtStore()

function handleSubmit(content: string) {
  store.addPost(content)
}

onMounted(() => {
  store.fetchPosts()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <CaptureInput @submit="handleSubmit" />
    <p v-if="store.error" class="text-sm text-red-400">{{ store.error }}</p>
    <div v-if="store.isLoading && store.feed.length === 0" class="py-8 text-center text-slate-500">
      Loading...
    </div>
    <div v-else class="flex flex-col gap-3">
      <PostCard
        v-for="post in store.feed"
        :key="post.id"
        :post="post"
      />
    </div>
  </div>
</template>
