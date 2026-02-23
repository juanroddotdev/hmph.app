<script setup lang="ts">
import { onMounted } from 'vue'
import LoginView from '@/views/LoginView.vue'
import MainView from '@/views/MainView.vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

onMounted(() => {
  auth.init()
})
</script>

<template>
  <div class="min-h-screen bg-slate-900">
    <div v-if="auth.isLoading" class="flex min-h-screen items-center justify-center">
      <p class="text-slate-400">Loading…</p>
    </div>
    <LoginView v-else-if="!auth.session" />
    <MainView v-else />
  </div>
</template>
