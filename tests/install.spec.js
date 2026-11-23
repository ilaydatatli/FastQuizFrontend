import { describe, expect, it, vi } from 'vitest'
import { isIos, isStandalone, useInstall } from '../src/composables/useInstall.js'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'
const IPAD_AS_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15'
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36'

describe('isIos', () => {
  it('recognises iPhone and iPad (also iPadOS posing as a Mac)', () => {
    expect(isIos(IPHONE)).toBe(true)
    expect(isIos(IPAD_AS_MAC, 5)).toBe(true)
  })

  it('a real Mac or Android is not iOS', () => {
    expect(isIos(IPAD_AS_MAC, 0)).toBe(false)
    expect(isIos(ANDROID, 5)).toBe(false)
  })
})

describe('isStandalone', () => {
  const win = (matches, standalone) => ({ matchMedia: () => ({ matches }), navigator: { standalone } })

  it('is true when opened from the home screen', () => {
    expect(isStandalone(win(true))).toBe(true)
    expect(isStandalone(win(false, true))).toBe(true) // older iOS Safari
  })

  it('is false in a normal browser tab', () => {
    expect(isStandalone(win(false, undefined))).toBe(false)
    expect(isStandalone({ navigator: {} })).toBe(false) // no matchMedia at all
  })
})

describe('useInstall', () => {
  it('hides the button until the browser says the site can be installed', async () => {
    const { mode, install } = useInstall()
    expect(mode.value).toBe(null) // jsdom is not iOS and no event yet

    const event = new Event('beforeinstallprompt', { cancelable: true })
    event.prompt = vi.fn()
    event.userChoice = Promise.resolve({ outcome: 'accepted' })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true) // no mini banner; our button instead
    expect(mode.value).toBe('prompt')

    await install()
    expect(event.prompt).toHaveBeenCalledOnce()
    expect(mode.value).toBe(null) // installed: button goes away
  })
})
