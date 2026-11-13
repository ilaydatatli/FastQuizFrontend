<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  categories: { type: Array, required: true },
  activeSlug: { type: String, default: '' },
})
</script>

<template>
  <nav class="tabs" aria-label="Kategoriler">
    <RouterLink
      v-for="category in categories"
      :key="category.slug"
      class="tab"
      :class="{ 'is-active': category.slug === activeSlug }"
      :style="{ '--accent': `var(--neon-${category.color})` }"
      :to="{ name: 'leaderboard', params: { slug: category.slug } }"
      :aria-current="category.slug === activeSlug ? 'page' : undefined"
    >
      {{ category.name }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto; /* many categories: scroll the tabs, never the page */
  padding-bottom: var(--space-2);
  scrollbar-width: thin;
}

.tab {
  flex: none;
  padding: var(--space-2) var(--space-3);
  border-bottom: 3px solid transparent;
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.tab:hover {
  color: var(--color-text);
  border-bottom-color: var(--color-border);
}

.tab.is-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 700;
  box-shadow: 0 6px 8px -6px var(--accent);
}
</style>
