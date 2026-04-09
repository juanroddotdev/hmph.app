import { onMounted, onUnmounted } from 'vue'
import { useThoughtStore } from '@/stores/thoughtStore'

/** Rough shake detection for undo; falls back to toast button when unavailable. */
export function useShakeUndo() {
  const store = useThoughtStore()

  let lastX = 0
  let lastY = 0
  let lastZ = 0
  let lastTime = 0
  let shakeCount = 0
  let cooldownUntil = 0

  const SHAKE_THRESHOLD = 14
  const SHAKE_GAP_MS = 120
  const SHAKES_TO_TRIGGER = 4
  const COOLDOWN_MS = 900

  function onMotion(e: DeviceMotionEvent) {
    const a = e.accelerationIncludingGravity
    if (a == null) return
    const now = Date.now()
    if (now < cooldownUntil) return

    const { x, y, z } = a
    if (x == null || y == null || z == null) return

    if (lastTime === 0) {
      lastX = x
      lastY = y
      lastZ = z
      lastTime = now
      return
    }

    const dt = now - lastTime
    if (dt < SHAKE_GAP_MS) return

    const delta =
      Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ)

    lastX = x
    lastY = y
    lastZ = z
    lastTime = now

    if (!store.feedUndo) {
      shakeCount = 0
      return
    }

    if (delta > SHAKE_THRESHOLD) {
      shakeCount += 1
      if (shakeCount >= SHAKES_TO_TRIGGER) {
        shakeCount = 0
        cooldownUntil = now + COOLDOWN_MS
        void store.undoFeedAction()
      }
    } else {
      shakeCount = Math.max(0, shakeCount - 1)
    }
  }

  onMounted(() => {
    const req = (
      DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    ).requestPermission
    if (typeof req === 'function') {
      void req()
        .then((status) => {
          if (status === 'granted') {
            window.addEventListener('devicemotion', onMotion, true)
          }
        })
        .catch(() => {
          /* no permission — toast undo still works */
        })
    } else {
      window.addEventListener('devicemotion', onMotion, true)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('devicemotion', onMotion, true)
  })
}
