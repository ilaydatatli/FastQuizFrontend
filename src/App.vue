<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="logo">FAST QUIZ</RouterLink>
    <RouterLink :to="{ name: 'leaderboard' }" class="nav-link">Skor Tablosu</RouterLink>
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

.nav-link {
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-weight: 500;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text);
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-8);
}
</style>
