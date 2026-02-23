import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const isLoading = ref(true)

  async function init() {
    const { data: { session: s } } = await supabase.auth.getSession()
    session.value = s
    isLoading.value = false

    supabase.auth.onAuthStateChange((_event, s) => {
      session.value = s
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, isLoading, init, signIn, signUp, signOut }
})
