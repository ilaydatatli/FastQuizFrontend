import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerBar from '../src/components/TimerBar.vue'

function mountBar(props = {}) {
  return mount(TimerBar, { props: { durationMs: 5000, totalMs: 5000, color: 'cyan', ...props } })
}

describe('TimerBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the category color while more than 2 s remain', async () => {
    const wrapper = mountBar()
    await vi.advanceTimersByTimeAsync(2500)

    expect(wrapper.attributes('data-level')).toBe('normal')
    expect(wrapper.attributes('style')).toContain('var(--neon-cyan)')
  })

  it('turns orange between 2 s and 1 s', async () => {
    const wrapper = mountBar()
    await vi.advanceTimersByTimeAsync(3500)

    expect(wrapper.attributes('data-level')).toBe('warning')
    expect(wrapper.attributes('style')).toContain('var(--neon-orange)')
  })

  it('turns red below 1 s', async () => {
    const wrapper = mountBar()
    await vi.advanceTimersByTimeAsync(4500)

    expect(wrapper.attributes('data-level')).toBe('danger')
    expect(wrapper.attributes('style')).toContain('var(--color-wrong)')
  })

  it('starts from the server remaining_ms, not the full limit', async () => {
    const wrapper = mountBar({ durationMs: 1500 })
    await vi.advanceTimersByTimeAsync(0)

    expect(wrapper.attributes('data-level')).toBe('warning')
    expect(wrapper.find('.seconds').text()).toBe('1.5')
  })

  it('emits expire exactly once when time runs out', async () => {
    const wrapper = mountBar()
    await vi.advanceTimersByTimeAsync(4900)
    expect(wrapper.emitted('expire')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(200)
    await vi.advanceTimersByTimeAsync(3000)

    expect(wrapper.emitted('expire')).toHaveLength(1)
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('does not emit expire after being stopped', async () => {
    const wrapper = mountBar()
    await vi.advanceTimersByTimeAsync(1000)
    await wrapper.setProps({ stopped: true })
    await vi.advanceTimersByTimeAsync(6000)

    expect(wrapper.emitted('expire')).toBeUndefined()
  })
})
