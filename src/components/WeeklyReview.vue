<script setup lang="ts">
import PostCard from './PostCard.vue'
import { useThoughtStore } from '@/stores/thoughtStore'
import { ListTodo } from 'lucide-vue-next'

const store = useThoughtStore()
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center gap-2 text-slate-300">
      <ListTodo class="h-5 w-5" />
      <h2 class="text-lg font-semibold">Review Mode — Triage Your Feed</h2>
    </header>
    <p class="text-sm text-slate-400">
      Items below are unprocessed. Mark as Done or Push to next week.
    </p>
    <div v-if="store.unprocessedPosts.length === 0" class="rounded-xl border border-slate-600/60 bg-slate-800/40 p-8 text-center text-slate-500">
      All clear. Nothing to triage.
    </div>
    <div v-else class="flex flex-col gap-3">
      <PostCard
        v-for="post in store.unprocessedPosts"
        :key="post.id"
        :post="post"
        :show-actions="true"
        @done="store.markAsDone(post.id)"
        @push="store.pushToNextWeek(post.id)"
      />
    </div>
  </section>
</template>
