<script setup>
import ChoiceButton from './ChoiceButton.vue'

const props = defineProps({
  question: { type: Object, required: true },
  selectedId: { type: Number, default: null },
  correctId: { type: Number, default: null }, // known only after the server answers
  locked: { type: Boolean, default: false },
})

defineEmits(['choose'])

function stateFor(choice) {
  if (props.correctId === null) return choice.id === props.selectedId ? 'selected' : 'idle'
  if (choice.id === props.correctId) return 'correct'
  if (choice.id === props.selectedId) return 'wrong'
  return 'muted'
}
</script>

<template>
  <div class="question-card">
    <h2 class="text">{{ question.text }}</h2>
    <div class="choices">
      <ChoiceButton
        v-for="(choice, i) in question.choices"
        :key="choice.id"
        :index="i + 1"
        :text="choice.text"
        :state="stateFor(choice)"
        :disabled="locked"
        @choose="$emit('choose', choice.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.question-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.text {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.35;
}

.choices {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .text {
    font-size: 1.625rem;
  }

  .choices {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
