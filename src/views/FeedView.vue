<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CaptureTrigger from '@/components/CaptureTrigger.vue'
import CaptureSheet from '@/components/CaptureSheet.vue'
import PostCard from '@/components/PostCard.vue'
import { useThoughtStore } from '@/stores/thoughtStore'

const store = useThoughtStore()
const showSheet = ref(false)

function handleSubmit(content: string) {
  store.addPost(content)
}

onMounted(() => {
  store.fetchPosts()
})
</script>

<template>
  <div class="relative flex flex-col gap-6">
    <p v-if="store.error" class="text-sm text-red-400">{{ store.error }}</p>
    <div v-if="store.isLoading && store.feed.length === 0" class="py-8 text-center text-slate-500">
      Loading...
    </div>
    <div v-else class="flex flex-col gap-3 pb-20">
      <PostCard
        v-for="post in store.feed"
        :key="post.id"
        :post="post"
      />
    </div>

    <!-- Thumb-friendly capture trigger: tap or swipe left to add -->
    <div class="fixed bottom-6 right-4 z-30 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
      <CaptureTrigger @open="showSheet = true" />
    </div>
    <CaptureSheet :show="showSheet" @close="showSheet = false" @submit="handleSubmit" />
  </div>
</template>
