<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getLeaderboard } from '../api/quiz.js'
import { errorMessage } from '../composables/useQuiz.js'
import CategoryTabs from '../components/CategoryTabs.vue'
import LeaderboardTable from '../components/LeaderboardTable.vue'
import NeonButton from '../components/NeonButton.vue'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const board = ref(null)
const loading = ref(true)
const errorText = ref('')
const canRetry = ref(true)
// Set by ResultView right after a score is saved.
const highlight = ref(window.history.state?.highlight ?? null)

async function load(slug) {
  loading.value = true
  errorText.value = ''
  try {
    if (categories.value.length === 0) categories.value = await getCategories()
    if (!slug) {
      const first = categories.value[0]
      if (first) router.replace({ name: 'leaderboard', params: { slug: first.slug } })
      return
    }
    board.value = await getLeaderboard(slug)
  } catch (error) {
    board.value = null
    errorText.value = errorMessage(error)
    canRetry.value = error.code !== 'CATEGORY_NOT_FOUND'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  (slug, oldSlug) => {
    if (oldSlug !== undefined && slug !== oldSlug) highlight.value = null
    load(slug)
  },
  { immediate: true },
)
</script>

<template>
  <section class="leaderboard">
    <h1>Skor Tablosu</h1>

    <CategoryTabs :categories="categories" :active-slug="route.params.slug || ''" />

    <p v-if="highlight && highlight.rank > 10" class="notice" role="status">
      Skorun kaydedildi! Sıran: {{ highlight.rank }}. İlk 10'a girmek için bir daha dene 💪
    </p>
    <p v-else-if="highlight" class="notice is-good" role="status">
      Skorun kaydedildi! {{ highlight.rank }}. sıradasın 🎉
    </p>

    <p v-if="loading" class="status" role="status">Yükleniyor…</p>

    <div v-else-if="errorText" class="error" role="alert">
      <p>{{ errorText }}</p>
      <NeonButton v-if="canRetry" @click="load(route.params.slug)">Tekrar dene</NeonButton>
    </div>

    <div
      v-else-if="board"
      class="board"
      :style="{ '--accent': `var(--neon-${board.category.color})` }"
    >
      <LeaderboardTable :entries="board.entries" :highlight="highlight" />
      <RouterLink to="/" class="play">Oynamaya başla →</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 640px;
  margin: var(--space-4) auto 0;
}

h1 {
  font-size: 1.75rem;
}

.status {
  color: var(--color-text-muted);
  text-align: center;
}

.notice {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-warning);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
}

.notice.is-good {
  border-color: var(--color-correct);
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

.board {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.play {
  align-self: center;
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
}
</style>
