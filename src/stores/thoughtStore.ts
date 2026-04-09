import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, type Post } from '@/lib/supabase'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export type FeedUndoPayload = {
  snapshot: Post
  kind: 'done' | 'push'
}

export const useThoughtStore = defineStore('thought', () => {
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** Last feed/review action eligible for shake / toast undo (~8s). */
  const feedUndo = ref<FeedUndoPayload | null>(null)
  let feedUndoTimer: ReturnType<typeof setTimeout> | null = null

  const FEED_UNDO_MS = 8000

  function clearFeedUndoTimer() {
    if (feedUndoTimer) {
      clearTimeout(feedUndoTimer)
      feedUndoTimer = null
    }
  }

  function offerFeedUndo(snapshot: Post, kind: 'done' | 'push') {
    clearFeedUndoTimer()
    feedUndo.value = { snapshot: { ...snapshot }, kind }
    feedUndoTimer = setTimeout(() => {
      feedUndo.value = null
      feedUndoTimer = null
    }, FEED_UNDO_MS)
  }

  function dismissFeedUndo() {
    clearFeedUndoTimer()
    feedUndo.value = null
  }

  async function undoFeedAction(): Promise<boolean> {
    const payload = feedUndo.value
    if (!payload) return false
    const snap = payload.snapshot
    dismissFeedUndo()

    const idx = posts.value.findIndex((p) => p.id === snap.id)
    if (idx === -1) return false

    posts.value[idx] = { ...snap }

    try {
      const { error: err } = await supabase
        .from('posts')
        .update({
          status: snap.status,
          is_processed: snap.is_processed,
          scheduled_for: snap.scheduled_for,
        })
        .eq('id', snap.id)

      if (err) throw err
      try {
        await Haptics.impact({ style: ImpactStyle.Light })
      } catch {
        /* native only */
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to undo'
      await fetchPosts()
      return false
    }
  }

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
  ): Promise<boolean> {
    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx === -1) return false

    const prev = posts.value[idx]
    posts.value[idx] = { ...prev, status, is_processed: isProcessed ?? prev.is_processed }

    try {
      const { error: err } = await supabase
        .from('posts')
        .update({ status, is_processed: isProcessed ?? prev.is_processed })
        .eq('id', id)

      if (err) throw err
      return true
    } catch (e) {
      posts.value[idx] = prev
      error.value = e instanceof Error ? e.message : 'Failed to update'
      return false
    }
  }

  async function markAsProcessed(id: string) {
    await updatePostStatus(id, 'active', true)
  }

  async function markAsDone(id: string) {
    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx === -1) return
    const snapshot = { ...posts.value[idx] }
    const ok = await updatePostStatus(id, 'done', true)
    if (ok) {
      offerFeedUndo(snapshot, 'done')
      try {
        await Haptics.impact({ style: ImpactStyle.Medium })
      } catch {
        /* native only */
      }
    }
  }

  async function updatePost(id: string, content: string): Promise<boolean> {
  const idx = posts.value.findIndex((p) => p.id === id)
  if (idx === -1) return false

  const prev = posts.value[idx]
  const trimmed = content.trim()
  posts.value[idx] = { ...prev, content: trimmed }

  try {
    const { error: err } = await supabase
      .from('posts')
      .update({ content: trimmed })
      .eq('id', id)

    if (err) throw err

    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch {}

    return true
  } catch (e) {
    posts.value[idx] = prev
    error.value = e instanceof Error ? e.message : 'Failed to update'
    return false
  }
}

async function deletePost(id: string): Promise<boolean> {
  const idx = posts.value.findIndex((p) => p.id === id)
  if (idx === -1) return false

  const [removed] = posts.value.splice(idx, 1)

  try {
    const { error: err } = await supabase.from('posts').delete().eq('id', id)

    if (err) throw err

    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {}

    return true
  } catch (e) {
    posts.value.splice(idx, 0, removed)
    error.value = e instanceof Error ? e.message : 'Failed to delete'
    return false
  }
}

  async function pushToNextWeek(id: string) {
    const nextMonday = new Date(getMondayOfCurrentWeek())
    nextMonday.setDate(nextMonday.getDate() + 7)

    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx === -1) return

    const snapshot = { ...posts.value[idx] }
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
      offerFeedUndo(snapshot, 'push')
      try {
        await Haptics.impact({ style: ImpactStyle.Medium })
      } catch {
        /* native only */
      }
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
    feedUndo,
    fetchPosts,
    addPost,
    updatePost,
    deletePost,
    updatePostStatus,
    markAsProcessed,
    markAsDone,
    pushToNextWeek,
    undoFeedAction,
    dismissFeedUndo,
  }
})
