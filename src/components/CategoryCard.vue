<script setup>
const props = defineProps({
  category: { type: Object, required: true },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    class="category-card"
    :style="{ '--accent': `var(--neon-${props.category.color})` }"
    @click="$emit('select', props.category)"
  >
    <span class="name">{{ category.name }}</span>
    <span class="description">{{ category.description }}</span>
    <span class="count">{{ category.question_count }} soru</span>
  </button>
</template>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-6);
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  /* currentColor drives the glow, so it must be the accent */
  color: var(--accent);
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.category-card:hover,
.category-card:focus-visible {
  background: var(--color-surface-2);
  box-shadow: var(--glow-md);
  transform: translateY(-2px);
}

.category-card:focus-visible {
  outline-color: var(--accent);
}

.name {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
}

.description {
  color: var(--color-text);
}

.count {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
</style>
