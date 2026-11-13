<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
    <h1>Sayfa bulunamadı</h1>
    <p>Aradığın sayfa burada değil.</p>
    <RouterLink to="/" class="home-link">Ana sayfaya dön</RouterLink>
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
