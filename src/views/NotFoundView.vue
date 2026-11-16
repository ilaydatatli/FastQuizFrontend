<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()
</script>

<template>
  <section class="not-found">
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.text') }}</p>
    <RouterLink to="/" class="home-link">{{ t('common.backHome') }}</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  text-align: center;
}

.home-link {
  color: var(--neon-cyan);
  font-family: var(--font-display);
  font-weight: 700;
}
</style>
