<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/lib/supabase'

const props = defineProps<{
  post: Post
  showActions?: boolean
}>()

const emit = defineEmits<{
  done: []
  push: []
}>()

// Highlight hashtags
const renderedContent = computed(() => {
  const content = props.post.content
  return content.replace(
    /#[\w\u0080-\uFFFF]+/g,
    '<span class="text-amber-400 font-medium">$&</span>'
  )
})
</script>

<template>
  <article
    class="rounded-xl border border-slate-600/60 bg-slate-800/60 p-4 transition hover:border-slate-500"
  >
    <p
      class="whitespace-pre-wrap text-slate-100"
      v-html="renderedContent"
    />
    <footer class="mt-3 flex items-center gap-2 text-xs text-slate-400">
      <time :datetime="post.created_at">
        {{ new Date(post.created_at).toLocaleDateString() }}
      </time>
      <span v-if="post.status === 'done'" class="rounded bg-emerald-900/50 px-2 py-0.5 text-emerald-400">
        Done
      </span>
      <span v-if="showActions && !post.is_processed" class="ml-auto flex gap-2">
        <button
          class="rounded bg-emerald-600/20 px-2 py-1 text-emerald-400 hover:bg-emerald-600/30"
          @click="emit('done')"
        >
          Done
        </button>
        <button
          class="rounded bg-amber-600/20 px-2 py-1 text-amber-400 hover:bg-amber-600/30"
          @click="emit('push')"
        >
          Push
        </button>
      </span>
    </footer>
  </article>
</template>
