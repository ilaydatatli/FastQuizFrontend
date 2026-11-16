<script setup>
import { computed, onMounted, watch } from 'vue'
import { useCountdown } from '../composables/useCountdown.js'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

const props = defineProps({
  durationMs: { type: Number, required: true }, // server remaining_ms
  totalMs: { type: Number, default: 10000 }, // server time_limit_ms
  color: { type: String, default: 'cyan' }, // category color key
  stopped: { type: Boolean, default: false },
})

const emit = defineEmits(['expire'])

const { remainingMs, start, stop } = useCountdown()
let expired = false

function onDone() {
  if (expired) return
  expired = true
  emit('expire')
}

onMounted(() => {
  if (props.stopped) remainingMs.value = props.durationMs
  else start(props.durationMs, onDone)
})

watch(
  () => props.stopped,
  (isStopped) => {
    if (isStopped) stop()
  },
)

const level = computed(() => {
  if (remainingMs.value > 2000) return 'normal'
  if (remainingMs.value >= 1000) return 'warning'
  return 'danger'
})

const barColor = computed(() => {
  if (level.value === 'warning') return 'var(--neon-orange)'
  if (level.value === 'danger') return 'var(--color-wrong)'
  return `var(--neon-${props.color})`
})

const ratio = computed(() => Math.min(1, Math.max(0, remainingMs.value / props.totalMs)))
const seconds = computed(() => (Math.ceil(remainingMs.value / 100) / 10).toFixed(1))
</script>

<template>
  <div class="timer" :class="`is-${level}`" :data-level="level" :style="{ '--bar-color': barColor }">
    <span class="seconds" aria-hidden="true">{{ seconds }}</span>
    <div
      class="track"
      role="progressbar"
      :aria-label="t('quiz.timeLeft')"
      aria-valuemin="0"
      :aria-valuemax="totalMs / 1000"
      :aria-valuenow="Number(seconds)"
      :aria-valuetext="t('quiz.seconds', { value: seconds })"
    >
      <div class="fill" :style="{ transform: `scaleX(${ratio})` }" />
    </div>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  color: var(--bar-color);
}

.seconds {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 1.125rem;
}

.track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: var(--color-surface-2);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 999px;
  background: currentColor;
  box-shadow: var(--glow-sm);
  transform-origin: left;
  transition: transform 0.1s linear;
}

.is-danger .fill {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    box-shadow: var(--glow-sm);
  }
  to {
    box-shadow: var(--glow-md);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-danger .fill {
    animation: none;
  }
}
</style>
