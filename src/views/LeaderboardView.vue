<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getLeaderboard } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { errorMessage } from '../composables/useQuiz.js'
import CategoryTabs from '../components/CategoryTabs.vue'
import LeaderboardTable from '../components/LeaderboardTable.vue'
import NeonButton from '../components/NeonButton.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const categories = ref([])
const board = ref(null)
const loading = ref(true)
const errorText = ref('')
const canRetry = ref(true)
// Set by ResultView right after a score is saved.
const highlight = ref(window.history.state?.highlight ?? null)

// One row per nickname: if the player already had a better score, that row stays.
const keptOlderBest = computed(() => {
  if (!highlight.value || !board.value) return null
  const row = board.value.entries.find(
    (e) => e.rank === highlight.value.rank && e.nickname === highlight.value.nickname,
  )
  return row && row.points > highlight.value.points ? row.points : null
})

async function load(slug) {
  loading.value = true
  errorText.value = ''
  try {
    if (categories.value.length === 0) categories.value = await getCategories(locale.value)
    if (!slug) {
      const first = categories.value[0]
      if (first) router.replace({ name: 'leaderboard', params: { slug: first.slug } })
      return
    }
    board.value = await getLeaderboard(slug, locale.value)
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

// Tab names and the category title depend on the language; scores are shared.
watch(locale, () => {
  categories.value = []
  load(route.params.slug)
})
</script>

<template>
  <section class="leaderboard">
    <h1>{{ t('leaderboard.title') }}</h1>

    <CategoryTabs :categories="categories" :active-slug="route.params.slug || ''" />

    <p v-if="highlight && highlight.rank > 10" class="notice" role="status">
      {{ t('leaderboard.savedBeyondTop', { rank: highlight.rank }) }}
    </p>
    <p v-else-if="highlight && keptOlderBest" class="notice" role="status">
      {{
        t('leaderboard.savedKeptOlder', {
          points: highlight.points,
          best: keptOlderBest,
          rank: highlight.rank,
        })
      }}
    </p>
    <p v-else-if="highlight" class="notice is-good" role="status">
      {{ t('leaderboard.saved', { rank: highlight.rank }) }}
    </p>

    <p v-if="loading" class="status" role="status">{{ t('common.loading') }}</p>

    <div v-else-if="errorText" class="error" role="alert">
      <p>{{ errorText }}</p>
      <NeonButton v-if="canRetry" @click="load(route.params.slug)">{{ t('common.retry') }}</NeonButton>
    </div>

    <div
      v-else-if="board"
      class="board"
      :style="{ '--accent': `var(--neon-${board.category.color})` }"
    >
      <LeaderboardTable :entries="board.entries" :highlight="highlight" />
      <RouterLink to="/" class="play">{{ t('leaderboard.play') }}</RouterLink>
    </div>

    <p v-else-if="categories.length === 0" class="status">{{ t('leaderboard.noCategories') }}</p>
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
