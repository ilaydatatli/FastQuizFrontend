<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from '../composables/useI18n.js'
import { cleanNickname, usePlayer } from '../composables/usePlayer.js'
import NeonButton from './NeonButton.vue'

const { t } = useI18n()
const { nickname, editing, setNickname, cancelEditing } = usePlayer()

const value = ref(nickname.value ?? '')
const error = ref('')
const input = ref(null)

function onSubmit() {
  if (!setNickname(value.value)) error.value = t('errors.NICKNAME_INVALID')
}

function onInput() {
  if (error.value && cleanNickname(value.value)) error.value = ''
}

onMounted(async () => {
  await nextTick()
  input.value?.focus()
})
</script>

<template>
  <div class="backdrop">
    <form
      class="card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nickname-title"
      novalidate
      @submit.prevent="onSubmit"
    >
      <h2 id="nickname-title">{{ t('player.title') }}</h2>
      <label class="sr-only" for="player-nickname">{{ t('player.label') }}</label>
      <input
        id="player-nickname"
        ref="input"
        v-model="value"
        type="text"
        maxlength="16"
        autocomplete="nickname"
        :placeholder="t('player.placeholder')"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="error ? 'player-error player-note' : 'player-note'"
        @input="onInput"
      />
      <p v-if="error" id="player-error" class="error" role="alert">{{ error }}</p>
      <p id="player-note" class="note">{{ t('player.note') }}</p>
      <NeonButton type="submit">{{ t('player.submit') }}</NeonButton>
      <button v-if="editing && nickname" type="button" class="cancel" @click="cancelEditing">
        {{ t('player.cancel') }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 380px;
  padding: var(--space-6);
  border: 2px solid var(--neon-cyan);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--glow-sm);
}

h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  text-align: center;
}

input {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
}

input:focus-visible {
  border-color: var(--neon-cyan);
  outline: none;
  box-shadow: 0 0 8px var(--neon-cyan);
}

input[aria-invalid='true'] {
  border-color: var(--color-wrong);
}

.error {
  color: var(--color-wrong);
  font-size: 0.875rem;
}

.note {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.cancel {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>
