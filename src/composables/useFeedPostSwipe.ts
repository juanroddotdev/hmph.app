import { ref, computed, type Ref } from 'vue'
import type { Post } from '@/lib/supabase'

const MAX_DRAG = 112
const COMMIT_PX = 56
const COMMIT_VEL = 0.42
const AXIS_LOCK_PX = 8

export type SwipeMode = 'unprocessed' | 'pushed' | 'done'

function rubberBand(raw: number, mode: SwipeMode): number {
  if (mode === 'done') {
    return raw * 0.12
  }
  if (mode === 'pushed') {
    if (raw >= 0) {
      return Math.min(raw, MAX_DRAG)
    }
    return raw * 0.18
  }
  if (raw >= 0) return Math.min(raw, MAX_DRAG)
  if (raw <= 0) return Math.max(raw, -MAX_DRAG)
  return 0
}

export function useFeedPostSwipe(options: {
  enabled: () => boolean
  post: () => Post
  swipeMode: () => SwipeMode
  cancelLongPress: () => void
  onCommitDone: () => Promise<void>
  onCommitPush: () => Promise<void>
  swipeSurfaceRef: Ref<HTMLElement | null>
}) {
  const dragX = ref(0)
  const swipeTransition = ref(false)

  let active = false
  let dragging = false
  let startX = 0
  let startY = 0
  let startT = 0
  let lastX = 0
  let lastT = 0
  let pointerId: number | null = null

  function resetPosition() {
    swipeTransition.value = true
    dragX.value = 0
    window.setTimeout(() => {
      swipeTransition.value = false
    }, 220)
  }

  function resolveCommit(dx: number, vx: number): 'done' | 'push' | null {
    const distOk = Math.abs(dx) >= COMMIT_PX
    const velOk = Math.abs(vx) >= COMMIT_VEL
    if (!distOk && !velOk) return null
    const mode = options.swipeMode()
    if (dx > 0) {
      if (mode === 'done') return null
      return 'done'
    }
    if (dx < 0) {
      if (mode !== 'unprocessed') return null
      return 'push'
    }
    return null
  }

  function onPointerDown(e: PointerEvent) {
    if (!options.enabled()) return
    if (e.button !== 0) return
    active = true
    dragging = false
    startX = e.clientX
    startY = e.clientY
    lastX = startX
    startT = performance.now()
    lastT = startT
    pointerId = e.pointerId
    swipeTransition.value = false
  }

  function onPointerMove(e: PointerEvent) {
    if (!active || pointerId !== e.pointerId) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (!dragging) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      if (Math.abs(dy) > Math.abs(dx) * 1.12) {
        active = false
        return
      }
      dragging = true
      options.cancelLongPress()
      const el = options.swipeSurfaceRef.value
      if (el?.setPointerCapture) {
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }
    }

    if (!dragging) return
    const now = performance.now()
    lastX = e.clientX
    lastT = now
    dragX.value = rubberBand(dx, options.swipeMode())
  }

  async function onPointerUp(e: PointerEvent) {
    if (!active || pointerId !== e.pointerId) {
      active = false
      dragging = false
      pointerId = null
      return
    }

    const el = options.swipeSurfaceRef.value
    if (el?.releasePointerCapture) {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }

    const dx = dragX.value
    const dt = Math.max(performance.now() - startT, 1)
    const vx = (e.clientX - startX) / dt
    const vxInstant =
      lastT > startT ? (e.clientX - lastX) / Math.max(performance.now() - lastT, 1) : 0
    const v = Math.max(Math.abs(vx), Math.abs(vxInstant))

    if (Math.abs(dx) < 4 && v < 0.2) {
      dragX.value = 0
      active = false
      dragging = false
      pointerId = null
      return
    }

    active = false
    dragging = false
    pointerId = null

    const action = resolveCommit(dx, v)
    if (action === 'done') {
      dragX.value = 0
      swipeTransition.value = true
      await options.onCommitDone()
      window.setTimeout(() => {
        swipeTransition.value = false
      }, 200)
      return
    }
    if (action === 'push') {
      dragX.value = 0
      swipeTransition.value = true
      await options.onCommitPush()
      window.setTimeout(() => {
        swipeTransition.value = false
      }, 200)
      return
    }

    resetPosition()
  }

  function onPointerCancel(e: PointerEvent) {
    if (pointerId === e.pointerId) {
      const el = options.swipeSurfaceRef.value
      if (el?.releasePointerCapture) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
      }
    }
    active = false
    dragging = false
    pointerId = null
    resetPosition()
  }

  const trackStyle = computed(() => ({
    transform: `translateX(${dragX.value}px)`,
    transition: swipeTransition.value ? 'transform 0.2s ease-out' : 'none',
    touchAction: 'pan-y' as const,
  }))

  return {
    dragX,
    swipeTransition,
    trackStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    resetPosition,
  }
}
