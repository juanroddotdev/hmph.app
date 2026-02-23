import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSlideNavStore = defineStore('slideNav', () => {
  const isOpen = ref(false)
  const draggedPostId = ref<string | null>(null)
  const hoveredGroup = ref<string | null>(null)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    draggedPostId.value = null
    hoveredGroup.value = null
  }

  function toggle() {
    isOpen.value = !isOpen.value
    if (!isOpen.value) {
      draggedPostId.value = null
      hoveredGroup.value = null
    }
  }

  function startDrag(postId: string) {
    draggedPostId.value = postId
  }

  function endDrag() {
    draggedPostId.value = null
    hoveredGroup.value = null
  }

  function setHoveredGroup(group: string | null) {
    hoveredGroup.value = group
  }

  return {
    isOpen,
    draggedPostId,
    hoveredGroup,
    open,
    close,
    toggle,
    startDrag,
    endDrag,
    setHoveredGroup,
  }
})
