<script setup>
defineProps({
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button :type="type" class="neon-button">
    <slot />
  </button>
</template>

<style scoped>
.neon-button {
  padding: var(--space-3) var(--space-6);
  border: 2px solid currentColor;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--neon-cyan);
  font-family: var(--font-display);
  font-weight: 700;
  cursor: pointer;
  transition: box-shadow 0.15s ease, background-color 0.15s ease;
}

.neon-button:hover,
.neon-button:focus-visible {
  background: var(--color-surface-2);
  box-shadow: var(--glow-md);
}

.neon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
