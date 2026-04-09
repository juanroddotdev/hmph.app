<script setup lang="ts">
import { ref } from 'vue'
import { LogIn, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { error: err } = isSignUp.value
      ? await auth.signUp(email.value, password.value)
      : await auth.signIn(email.value, password.value)

    if (err) {
      error.value = err.message
      return
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center px-4">
    <h1 class="mb-2 text-3xl font-bold text-amber-400">HMPF</h1>
    <p class="mb-8 text-slate-400">Capture first. Review later.</p>

    <form
      class="w-full max-w-sm space-y-4"
      @submit.prevent="submit"
    >
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          autocomplete="email"
          class="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          :minlength="isSignUp ? 6 : 1"
          autocomplete="current-password"
          class="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-amber-500"
        />
        <p v-if="isSignUp" class="mt-1 text-xs text-slate-500">Min 6 characters</p>
      </div>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-medium text-slate-900 transition hover:bg-amber-400 disabled:opacity-50"
      >
        <LogIn v-if="!isSignUp" class="h-4 w-4" />
        <UserPlus v-else class="h-4 w-4" />
        {{ loading ? '…' : isSignUp ? 'Sign Up' : 'Sign In' }}
      </button>

      <button
        type="button"
        class="w-full text-center text-sm text-slate-400 hover:text-slate-300"
        @click="isSignUp = !isSignUp; error = ''"
      >
        {{ isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
      </button>
    </form>
  </div>
</template>
