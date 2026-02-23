<script setup lang="ts">
import { ref } from 'vue'
import { PenLine, ListTodo } from 'lucide-vue-next'

const activeTab = ref<'feed' | 'review'>('feed')
</script>

<template>
  <div class="min-h-screen bg-slate-900 pb-[env(safe-area-inset-bottom)]">
    <header class="sticky top-0 z-10 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur">
      <div class="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-amber-400">HMPF</h1>
        <nav class="flex gap-1">
          <button
            :class="[
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              activeTab === 'feed'
                ? 'bg-slate-700 text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            ]"
            @click="activeTab = 'feed'"
          >
            <PenLine class="h-4 w-4" />
            Capture
          </button>
          <button
            :class="[
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              activeTab === 'review'
                ? 'bg-slate-700 text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            ]"
            @click="activeTab = 'review'"
          >
            <ListTodo class="h-4 w-4" />
            Review
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-md px-4 pt-6 pb-8">
      <FeedView v-show="activeTab === 'feed'" />
      <ReviewView v-show="activeTab === 'review'" />
    </main>
  </div>
</template>
