import { ref } from 'vue'
import { useSlideNavStore } from '@/stores/slideNavStore'
import { useGroupsStore } from '@/stores/groupsStore'

const DRAG_THRESHOLD = 50
const LONG_PRESS_MS = 400

export function useDragToGroup(postId: string, onLongPressOnly?: () => void) {
  const navStore = useSlideNavStore()
  const groupsStore = useGroupsStore()

  const isLongPressFired = ref(false)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragStartTime = ref(0)
  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  function onPointerDown(e: PointerEvent) {
    isLongPressFired.value = false
    isDragging.value = false
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY
    dragStartTime.value = Date.now()
    longPressTimer = setTimeout(() => {
      isLongPressFired.value = true
      longPressTimer = null
    }, LONG_PRESS_MS)
  }

  function onPointerMove(e: PointerEvent) {
    const deltaX = e.clientX - dragStartX.value
    const deltaY = e.clientY - dragStartY.value

    // Start drag when user moves right (works immediately, no long-press required)
    if (!isDragging.value && deltaX > DRAG_THRESHOLD && Math.abs(deltaY) < 80) {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
      isLongPressFired.value = true
      isDragging.value = true
      navStore.open()
      navStore.startDrag(postId)
    }

    if (isDragging.value) {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const groupEl = el?.closest('[data-group]')
      navStore.setHoveredGroup(
        groupEl ? (groupEl.getAttribute('data-group') ?? null) : null
      )
    }
  }

  function onPointerUp() {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (isDragging.value) {
      const group = navStore.hoveredGroup
      if (group) {
        groupsStore.assignPostToGroup(postId, group)
        navStore.close()
      }
      navStore.endDrag()
      isDragging.value = false
    } else if (isLongPressFired.value && onLongPressOnly) {
      onLongPressOnly()
    }

    isLongPressFired.value = false
  }

  return {
    isLongPressFired,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
