import { computed, ref } from 'vue'

/** iPhone/iPod/iPad; iPadOS pretends to be a Mac but has a touch screen. */
export function isIos(userAgent = '', maxTouchPoints = 0) {
  return /iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}

/** Opened from the home screen icon (already installed)? */
export function isStandalone(win = window) {
  return Boolean(win.matchMedia?.('(display-mode: standalone)').matches || win.navigator?.standalone)
}

// Chrome/Android fires `beforeinstallprompt` when the site can be installed. We keep the
// event and show our own button instead of the browser's mini banner. Listen as soon as
// this module loads, because the event can come before any component is mounted.
const deferredPrompt = ref(null)
const installed = ref(false)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferredPrompt.value = null
  })
}

/**
 * mode: 'prompt' (browser can show its install dialog), 'ios' (show the
 * "Share → Add to Home Screen" hint) or null (hide the button).
 */
export function useInstall() {
  const ios = typeof navigator !== 'undefined' && isIos(navigator.userAgent, navigator.maxTouchPoints)

  const mode = computed(() => {
    if (installed.value || (typeof window !== 'undefined' && isStandalone(window))) return null
    if (deferredPrompt.value) return 'prompt'
    return ios ? 'ios' : null
  })

  async function install() {
    const event = deferredPrompt.value
    if (!event) return
    deferredPrompt.value = null // the browser allows prompt() only once per event
    event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'accepted') installed.value = true
  }

  return { mode, install }
}
