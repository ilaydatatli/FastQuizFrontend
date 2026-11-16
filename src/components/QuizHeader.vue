<script setup>
import { useI18n } from '../composables/useI18n.js'

const { t } = useI18n()

defineProps({
  categoryName: { type: String, required: true },
  number: { type: Number, required: true }, // 1-based question number
  total: { type: Number, required: true },
  points: { type: Number, required: true }, // always the server's value
})
</script>

<template>
  <div class="quiz-header">
    <p class="progress">
      <span class="category">{{ categoryName }}</span>
      <span aria-hidden="true"> · </span>
      <span class="count">{{ number }} / {{ total }}</span>
    </p>
    <p class="points">{{ points }} <span class="unit">{{ t('common.points') }}</span></p>
  </div>
</template>

<style scoped>
.quiz-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
}

.category {
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
}

.count,
.points {
  font-family: var(--font-mono);
  font-weight: 500;
}

.unit {
  color: var(--color-text-muted);
}
</style>
