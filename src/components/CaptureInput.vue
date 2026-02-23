<script setup lang="ts">
import { ref, onMounted } from 'vue'

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  submit: [content: string]
}>()

const inputRef = ref<HTMLTextAreaElement | null>(null)

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    const content = model.value?.trim()
    if (content) {
      emit('submit', content)
      model.value = ''
    }
  }
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="relative w-full">
    <textarea
      ref="inputRef"
      v-model="model"
      class="w-full min-h-[3rem] max-h-32 resize-none rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      placeholder="Type something... Hit Enter to capture."
      rows="1"
      @keydown="handleKeyDown"
    />
  </div>
</template>
