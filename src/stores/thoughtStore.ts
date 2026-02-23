import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type Post } from '@/lib/supabase'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const useThoughtStore = defineStore('thought', () => {
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Reverse-chronological feed
  const feed = computed(() =>
    [...posts.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  )

  // Unprocessed items for Weekly Review
  const unprocessedPosts = computed(() =>
    feed.value.filter((p) => !p.is_processed)
  )

  async function fetchPosts() {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      posts.value = data ?? []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch posts'
    } finally {
      isLoading.value = false
    }
  }

  async function addPost(content: string): Promise<Post | null> {
    const tempId = `temp-${Date.now()}`
    const newPost: Post = {
      id: tempId,
      user_id: '', // Will be set by Supabase from RLS
      content: content.trim(),
      status: 'active',
      is_processed: false,
      visibility: 'private',
      scheduled_for: getMondayOfCurrentWeek().toISOString(),
      created_at: new Date().toISOString(),
    }

    // Optimistic update: push immediately
    posts.value = [newPost, ...posts.value]

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        error.value = 'Not authenticated'
        // Rollback optimistic update
        posts.value = posts.value.filter((p) => p.id !== tempId)
        return null
      }

      const { data, error: err } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPost.content,
          status: newPost.status,
          is_processed: newPost.is_processed,
          visibility: newPost.visibility,
          scheduled_for: newPost.scheduled_for,
        })
        .select()
        .single()

      if (err) throw err

      // Replace temp post with real one
      posts.value = posts.value.map((p) =>
        p.id === tempId ? data : p
      )

      // Haptic feedback on save (Capacitor)
      try {
        await Haptics.impact({ style: ImpactStyle.Light })
      } catch {
        // Ignore if not in Capacitor
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save'
      posts.value = posts.value.filter((p) => p.id !== tempId)
      return null
    }
  }

  async function updatePostStatus(
    id: string,
    status: Post['status'],
    isProcessed?: boolean
  ) {
    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx === -1) return

    const prev = posts.value[idx]
    posts.value[idx] = { ...prev, status, is_processed: isProcessed ?? prev.is_processed }

    try {
      const { error: err } = await supabase
        .from('posts')
        .update({ status, is_processed: isProcessed ?? prev.is_processed })
        .eq('id', id)

      if (err) throw err
    } catch (e) {
      posts.value[idx] = prev
      error.value = e instanceof Error ? e.message : 'Failed to update'
    }
  }

  async function markAsProcessed(id: string) {
    await updatePostStatus(id, 'active', true)
  }

  async function markAsDone(id: string) {
    await updatePostStatus(id, 'done', true)
  }

  async function pushToNextWeek(id: string) {
    const nextMonday = new Date(getMondayOfCurrentWeek())
    nextMonday.setDate(nextMonday.getDate() + 7)

    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx === -1) return

    const prev = posts.value[idx]
    posts.value[idx] = {
      ...prev,
      is_processed: true,
      scheduled_for: nextMonday.toISOString(),
    }

    try {
      const { error: err } = await supabase
        .from('posts')
        .update({ is_processed: true, scheduled_for: nextMonday.toISOString() })
        .eq('id', id)

      if (err) throw err
    } catch (e) {
      posts.value[idx] = prev
      error.value = e instanceof Error ? e.message : 'Failed to push'
    }
  }

  function getMondayOfCurrentWeek(): Date {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  return {
    posts,
    feed,
    unprocessedPosts,
    isLoading,
    error,
    fetchPosts,
    addPost,
    updatePostStatus,
    markAsProcessed,
    markAsDone,
    pushToNextWeek,
  }
})
