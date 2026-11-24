<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// Sound questions (Faz 26). The server decides the timing: the answer time starts
// `audio.left_ms` after the question was shown, whether or not the sound really played.
const props = defineProps({
  audio: { type: Object, required: true }, // { url, duration_ms, left_ms }
})

const { t } = useI18n()

const playing = ref(false)
const blocked = ref(false) // the browser refused to start the sound without a tap
let player = null

async function play(fromMs = 0) {
  if (!player) return
  try {
    player.currentTime = fromMs / 1000
    await player.play()
    blocked.value = false
  } catch {
    blocked.value = true // e.g. iPhone: sound needs a tap first
  }
}

onMounted(() => {
  player = new Audio(props.audio.url)
  player.addEventListener('playing', () => (playing.value = true))
  player.addEventListener('pause', () => (playing.value = false))
  player.addEventListener('ended', () => (playing.value = false))
  // After a page refresh, continue where the sound would be now.
  play(Math.max(0, props.audio.duration_ms - props.audio.left_ms))
})

onBeforeUnmount(() => {
  player?.pause()
  player = null
})
</script>

<template>
  <div class="sound" :class="{ 'is-playing': playing }">
    <span class="icon" aria-hidden="true">{{ playing ? '🔊' : '🔈' }}</span>
    <span class="label" role="status">{{ playing ? t('quiz.listening') : t('quiz.soundQuestion') }}</span>
    <button type="button" class="button" @click="play(0)">
      {{ blocked ? `▶ ${t('quiz.playSound')}` : `↻ ${t('quiz.replaySound')}` }}
    </button>
  </div>
</template>

<style scoped>
.sound {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px dashed var(--accent, var(--neon-cyan));
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.icon {
  font-size: 1.5rem;
}

.is-playing .icon {
  animation: pulse 0.8s ease-in-out infinite alternate;
}

.label {
  flex: 1;
  color: var(--color-text-muted);
  font-family: var(--font-display);
}

.button {
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--accent, var(--neon-cyan));
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--accent, var(--neon-cyan));
  font-family: var(--font-display);
  font-weight: 700;
  cursor: pointer;
}

@keyframes pulse {
  to {
    transform: scale(1.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-playing .icon {
    animation: none;
  }
}
</style>
