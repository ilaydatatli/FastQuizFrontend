<script setup>
import { LANGUAGES, useI18n } from '../composables/useI18n.js'

const { t, locale, setLanguage } = useI18n()
</script>

<template>
  <div class="switcher" role="group" :aria-label="t('nav.language')">
    <button
      v-for="language in LANGUAGES"
      :key="language"
      type="button"
      class="option"
      :class="{ 'is-active': language === locale }"
      :aria-pressed="language === locale ? 'true' : 'false'"
      :lang="language"
      :title="t(`languages.${language}`)"
      @click="setLanguage(language)"
    >
      {{ language.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.switcher {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.option {
  padding: var(--space-1) var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  cursor: pointer;
}

.option:hover {
  color: var(--color-text);
}

.option.is-active {
  background: var(--color-surface-2);
  color: var(--neon-cyan);
}
</style>
