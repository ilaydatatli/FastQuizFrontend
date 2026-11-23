<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

defineProps({
  index: { type: Number, required: true }, // 1–4, also the keyboard shortcut
  text: { type: String, required: true },
  // idle | selected | correct | wrong | muted
  state: { type: String, default: 'idle' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['choose'])
</script>

<template>
  <button
    type="button"
    class="choice"
    :class="`is-${state}`"
    :disabled="disabled"
    :aria-keyshortcuts="String(index)"
    @click="$emit('choose')"
  >
    <span class="key" aria-hidden="true">{{ index }}</span>
    <span class="text">{{ text }}</span>
    <span v-if="state === 'correct'" class="icon">
      <span aria-hidden="true">✓</span><span class="sr-only">{{ t('quiz.correctAnswer') }}</span>
    </span>
    <span v-else-if="state === 'wrong'" class="icon">
      <span aria-hidden="true">✗</span><span class="sr-only">{{ t('quiz.wrongAnswer') }}</span>
    </span>
  </button>
</template>

<style scoped>
.choice {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 56px;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1.0625rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
}

.choice:focus-visible {
  border-color: var(--accent, var(--neon-cyan));
  background: var(--color-surface-2);
}

/* Only with a real mouse: on phones :hover sticks to the last tapped spot,
   so the next question's answer in that place looked already chosen. */
@media (hover: hover) {
  .choice:not(:disabled):hover {
    border-color: var(--accent, var(--neon-cyan));
    background: var(--color-surface-2);
  }
}

.choice:disabled {
  cursor: default;
}

.key {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.text {
  flex: 1;
}

.icon {
  flex: none;
  font-size: 1.25rem;
  font-weight: 700;
}

.is-selected {
  border-color: var(--accent, var(--neon-cyan));
}

.is-correct {
  border-color: var(--color-correct);
  color: var(--color-correct);
  box-shadow: 0 0 12px var(--color-correct);
}

.is-wrong {
  border-color: var(--color-wrong);
  color: var(--color-wrong);
  box-shadow: 0 0 12px var(--color-wrong);
}

.is-correct .text,
.is-wrong .text {
  color: var(--color-text);
}

.is-muted {
  opacity: 0.55;
}

@media (min-width: 640px) {
  .choice {
    font-size: 1.1875rem;
  }
}
</style>
