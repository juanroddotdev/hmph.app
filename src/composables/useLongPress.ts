import { ref } from 'vue'

const DEFAULT_DURATION = 500

export function useLongPress(
  onLongPress: () => void,
  options: { duration?: number; onShortPress?: () => void } = {}
) {
  const { duration = DEFAULT_DURATION, onShortPress } = options
  const isLongPress = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function start() {
    isLongPress.value = false
    timer = setTimeout(() => {
      isLongPress.value = true
      onLongPress()
      timer = null
    }, duration)
  }

  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
      if (!isLongPress.value && onShortPress) {
        onShortPress()
      }
    }
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { start, stop, cancel }
}
