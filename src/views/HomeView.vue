<script setup>
import { onMounted, ref } from 'vue'
import { getCategories } from '../api/quiz.js'
import CategoryCard from '../components/CategoryCard.vue'
import NeonButton from '../components/NeonButton.vue'

const categories = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function loadCategories() {
  loading.value = true
  errorMessage.value = ''
  try {
    categories.value = await getCategories()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

// Starting a quiz is implemented in Faz 8.
function onSelect() {}

onMounted(loadCategories)
</script>

<template>
  <section class="hero">
    <h1>Hızlı düşün, hızlı cevapla.</h1>
    <p class="rules">20 soru · her biri 5 saniye · atlamak yok</p>
  </section>

  <p v-if="loading" class="status" role="status">Kategoriler yükleniyor…</p>

  <div v-else-if="errorMessage" class="error" role="alert">
    <p>{{ errorMessage }}</p>
    <NeonButton @click="loadCategories">Tekrar dene</NeonButton>
  </div>

  <p v-else-if="categories.length === 0" class="status">Şu an oynanabilir kategori yok.</p>

  <ul v-else class="grid">
    <li v-for="category in categories" :key="category.slug">
      <CategoryCard :category="category" @select="onSelect" />
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
