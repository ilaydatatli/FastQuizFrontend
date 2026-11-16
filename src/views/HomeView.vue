<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { errorMessage, useQuiz } from '../composables/useQuiz.js'
import CategoryCard from '../components/CategoryCard.vue'
import NeonButton from '../components/NeonButton.vue'

const router = useRouter()
const quiz = useQuiz()
const { t, locale } = useI18n()

const categories = ref([])
const loading = ref(true)
const loadError = ref('')
const starting = ref(false)
const startError = ref('')
const notice = ref(readNotice())

// QuizView sends a one-time info message (e.g. expired quiz) through history state.
function readNotice() {
  const text = window.history.state?.notice
  if (text) window.history.replaceState({ ...window.history.state, notice: null }, '')
  return text || ''
}

async function loadCategories() {
  loading.value = true
  loadError.value = ''
  try {
    categories.value = await getCategories(locale.value)
  } catch (error) {
    loadError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function onSelect(category) {
  if (starting.value) return
  starting.value = true
  startError.value = ''
  notice.value = ''
  try {
    const { quizId } = await quiz.start(category.slug)
    await router.push({ name: 'quiz', params: { quizId } })
  } catch (error) {
    startError.value = errorMessage(error)
  } finally {
    starting.value = false
  }
}

onMounted(loadCategories)
// Category names and the playable list depend on the language.
watch(locale, loadCategories)
</script>

<template>
  <section class="hero">
    <h1>{{ t('home.title') }}</h1>
    <p class="rules">{{ t('home.rules') }}</p>
  </section>

  <p v-if="notice" class="notice" role="status">{{ notice }}</p>
  <p v-if="startError" class="notice is-error" role="alert">{{ startError }}</p>

  <p v-if="loading" class="status" role="status">{{ t('home.loading') }}</p>

  <div v-else-if="loadError" class="error" role="alert">
    <p>{{ loadError }}</p>
    <NeonButton @click="loadCategories">{{ t('common.retry') }}</NeonButton>
  </div>

  <p v-else-if="categories.length === 0" class="status">{{ t('home.empty') }}</p>

  <ul v-else class="grid">
    <li v-for="category in categories" :key="category.slug">
      <CategoryCard :category="category" :disabled="starting" @select="onSelect" />
    </li>
  </ul>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: var(--space-6) 0 var(--space-8);
  text-align: center;
}

h1 {
  font-size: 1.75rem;
}

.rules {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.status {
  color: var(--color-text-muted);
  text-align: center;
}

.notice {
  margin-bottom: var(--space-6);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-warning);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.notice.is-error {
  border-color: var(--color-wrong);
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 2px solid var(--color-wrong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 640px) {
  h1 {
    font-size: 2.25rem;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
