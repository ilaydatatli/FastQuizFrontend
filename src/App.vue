<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="logo">FAST QUIZ</RouterLink>
    <!-- "Skor Tablosu" link is added in Faz 9 together with LeaderboardView. -->
  </header>
  <main class="page">
    <RouterView />
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-4);
}

.logo {
  color: var(--neon-cyan);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  text-shadow: var(--glow-sm);
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-8);
}
</style>
