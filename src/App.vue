<script setup>
import { RouterLink, RouterView } from 'vue-router'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { useI18n } from './composables/useI18n.js'

const { t } = useI18n()
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="logo">FAST QUIZ</RouterLink>
    <div class="actions">
      <RouterLink :to="{ name: 'leaderboard' }" class="nav-link">{{ t('nav.leaderboard') }}</RouterLink>
      <LanguageSwitcher />
    </div>
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

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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

/* Narrow phones: logo + menu + language switcher must fit on one line */
@media (max-width: 420px) {
  .topbar {
    gap: var(--space-3);
  }

  .logo {
    font-size: 1.15rem;
    letter-spacing: 0.04em;
  }

  .actions {
    gap: var(--space-2);
  }

  .nav-link {
    font-size: 0.875rem;
  }
}

.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-8);
}
</style>
