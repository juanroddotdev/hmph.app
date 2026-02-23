import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'

export function isNative() {
  return Capacitor.isNativePlatform()
}

export async function setupKeyboard() {
  if (!isNative()) return
  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false })
    Keyboard.setScroll({ isDisabled: false })
  } catch {
    // Ignore if keyboard plugin not available
  }
}
