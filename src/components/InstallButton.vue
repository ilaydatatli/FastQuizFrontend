<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '../composables/useI18n.js'
import { useInstall } from '../composables/useInstall.js'

const { t } = useI18n()
const { mode, install } = useInstall()
const showHint = ref(false)

function onClick() {
  if (mode.value === 'prompt') install()
  else if (mode.value === 'ios') showHint.value = !showHint.value
}

function onKeydown(event) {
  if (event.key === 'Escape') showHint.value = false
}

watch(showHint, (open) => {
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <template v-if="mode">
    <button
      type="button"
      class="install"
      :aria-expanded="mode === 'ios' ? String(showHint) : undefined"
      @click="onClick"
    >
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14" />
      </svg>
      <span>{{ t('install.label') }}</span>
    </button>

    <div v-if="showHint" class="hint" role="dialog" :aria-label="t('install.iosTitle')">
      <p class="title">{{ t('install.iosTitle') }}</p>
      <ol>
        <li>
          {{ t('install.iosStep1') }}
          <svg class="share" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 15V3m0 0L8 7m4-4 4 4M7 11H5v10h14V11h-2" />
          </svg>
        </li>
        <li>{{ t('install.iosStep2') }}</li>
      </ol>
      <button type="button" class="close" @click="showHint = false">{{ t('install.close') }}</button>
    </div>
  </template>
</template>

<style scoped>
.install {
  display: flex;
  align-self: center;
  margin: 0 auto;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--neon-cyan);
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.install:hover {
  background: var(--color-surface-2);
}

.icon,
.share {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.share {
  vertical-align: -0.15em;
  color: var(--neon-cyan);
}

/* Bottom sheet: Safari's Share button is at the bottom of the screen on iPhone */
.hint {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  left: var(--space-4);
  z-index: 10;
  max-width: 420px;
  margin: 0 auto;
  padding: var(--space-4);
  border: 2px solid var(--neon-cyan);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--glow-sm);
  text-align: left;
}

.title {
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
}

ol {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  padding-left: var(--space-4);
}

.close {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-family: var(--font-display);
  cursor: pointer;
}
</style>
