<script setup lang="ts">
import { ref } from 'vue'
import { PenLine, ListTodo, LogOut, Settings } from 'lucide-vue-next'
import FeedView from '@/views/FeedView.vue'
import ReviewView from '@/views/ReviewView.vue'
import SettingsView from '@/views/SettingsView.vue'
import SlideNav from '@/components/SlideNav.vue'
import SlideNavTrigger from '@/components/SlideNavTrigger.vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const activeTab = ref<'feed' | 'review' | 'settings'>('feed')
</script>

<template>
  <div class="min-h-screen bg-slate-900 pb-[env(safe-area-inset-bottom)]">
    <SlideNav />
    <SlideNavTrigger />
    <header class="sticky top-0 z-10 border-b border-slate-700/80 bg-slate-900/95 backdrop-blur">
      <div class="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <h1 class="text-xl font-bold text-amber-400">HMPF</h1>
        <nav class="flex items-center gap-1">
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
          <button
            :class="[
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              activeTab === 'settings'
                ? 'bg-slate-700 text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            ]"
            @click="activeTab = 'settings'"
          >
            <Settings class="h-4 w-4" />
            Settings
          </button>
          <button
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
            title="Sign out"
            @click="auth.signOut()"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-md px-4 pt-6 pb-8">
      <FeedView v-show="activeTab === 'feed'" />
      <ReviewView v-show="activeTab === 'review'" />
      <SettingsView v-show="activeTab === 'settings'" />
    </main>
  </div>
</template>
