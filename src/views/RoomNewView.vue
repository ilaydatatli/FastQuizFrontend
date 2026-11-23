<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createRoom, getCategories } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { errorMessage } from '../composables/useQuiz.js'
import CategoryCard from '../components/CategoryCard.vue'
import NeonButton from '../components/NeonButton.vue'

const router = useRouter()
const { t, locale } = useI18n()

const categories = ref([])
const loading = ref(true)
const loadError = ref('')
const creating = ref(false)
const createError = ref('')

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
  if (creating.value) return
  creating.value = true
  createError.value = ''
  try {
    const room = await createRoom(category.slug, locale.value)
    // replace: the back button should not open another room.
    await router.replace({ name: 'room', params: { code: room.code }, state: { created: true } })
  } catch (error) {
    createError.value = errorMessage(error)
  } finally {
    creating.value = false
  }
}

onMounted(loadCategories)
watch(locale, loadCategories)
</script>

<template>
  <section class="intro">
    <h1>{{ t('room.newTitle') }} 👥</h1>
    <p class="text">{{ t('room.newIntro') }}</p>
  </section>

  <p v-if="creating" class="status" role="status">{{ t('room.creating') }}</p>
  <p v-if="createError" class="notice" role="alert">{{ createError }}</p>

  <p v-if="loading" class="status" role="status">{{ t('home.loading') }}</p>

  <div v-else-if="loadError" class="notice" role="alert">
    <p>{{ loadError }}</p>
    <NeonButton @click="loadCategories">{{ t('common.retry') }}</NeonButton>
  </div>

  <ul v-else class="grid">
    <li v-for="category in categories" :key="category.slug">
      <CategoryCard :category="category" :disabled="creating" @select="onSelect" />
    </li>
  </ul>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: var(--space-6) 0;
  text-align: center;
}

h1 {
  font-size: 1.75rem;
}

.text,
.status {
  color: var(--color-text-muted);
  text-align: center;
}

.notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-3) var(--space-4);
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
