import { getCurrentScope, onScopeDispose, ref } from 'vue'

const raf = (cb) =>
  typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : setTimeout(cb, 16)
const cancelRaf = (id) =>
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id)

// Visual-only countdown: counts down from the server's remaining_ms using Date.now() deltas.
export function useCountdown() {
  const remainingMs = ref(0)
  let deadline = 0
  let frame = null
  let onDone = null

  function tick() {
    const left = Math.max(0, deadline - Date.now())
    remainingMs.value = left
    if (left === 0) {
      frame = null
      const done = onDone
      onDone = null
      done?.()
      return
    }
    frame = raf(tick)
  }

  function start(ms, done) {
    stop()
    deadline = Date.now() + Math.max(0, ms)
    onDone = done
    tick()
  }

  function stop() {
    if (frame !== null) {
      cancelRaf(frame)
      frame = null
    }
    onDone = null
  }

  if (getCurrentScope()) onScopeDispose(stop)

  return { remainingMs, start, stop }
}
