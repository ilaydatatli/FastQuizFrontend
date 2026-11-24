import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SoundPlayer from '../src/components/SoundPlayer.vue'

function fakeAudio({ refuse = false } = {}) {
  const made = []
  vi.stubGlobal(
    'Audio',
    class {
      constructor(url) {
        this.url = url
        this.currentTime = 0
        this.play = vi.fn(() => (refuse ? Promise.reject(new Error('blocked')) : Promise.resolve()))
        this.pause = vi.fn()
        this.addEventListener = vi.fn()
        made.push(this)
      }
    },
  )
  return made
}

const audio = { url: '/sounds/test.mp3', duration_ms: 3000, left_ms: 3000 }

describe('SoundPlayer', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('plays the sound from the start', async () => {
    const made = fakeAudio()
    mount(SoundPlayer, { props: { audio } })
    await flushPromises()
    expect(made[0].url).toBe('/sounds/test.mp3')
    expect(made[0].play).toHaveBeenCalled()
    expect(made[0].currentTime).toBe(0)
  })

  it('continues where it would be after a refresh', async () => {
    const made = fakeAudio()
    mount(SoundPlayer, { props: { audio: { ...audio, left_ms: 1000 } } })
    await flushPromises()
    expect(made[0].currentTime).toBe(2)
  })

  it('offers a play button when the browser blocks the sound', async () => {
    fakeAudio({ refuse: true })
    const wrapper = mount(SoundPlayer, { props: { audio } })
    await flushPromises()
    expect(wrapper.find('button').text()).toContain('▶')
  })

  it('stops the sound when the question changes', async () => {
    const made = fakeAudio()
    const wrapper = mount(SoundPlayer, { props: { audio } })
    await flushPromises()
    wrapper.unmount()
    expect(made[0].pause).toHaveBeenCalled()
  })
})
