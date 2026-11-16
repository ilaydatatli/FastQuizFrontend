<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResult, saveScore } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { errorMessage, useQuiz } from '../composables/useQuiz.js'
import NeonButton from '../components/NeonButton.vue'

const route = useRoute()
const router = useRouter()
const quiz = useQuiz()
const { t } = useI18n()

// Set by QuizView when the quiz finished (see useQuiz.finish).
const saved = window.history.state?.quiz ?? null
const quizId = route.params.quizId

const loading = ref(true)
const loadError = ref('')
const result = ref(null)
const nickname = ref('')
const nicknameError = ref('')
const formError = ref('')
const busy = ref(false)

function leaveToHome(notice) {
  router.replace({ name: 'home', state: { notice } })
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await getResult(quizId, saved.token)
  } catch (error) {
    if (['QUIZ_EXPIRED', 'INVALID_TOKEN', 'QUIZ_NOT_FOUND'].includes(error.code)) {
      leaveToHome(errorMessage(error))
      return
    }
    loadError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (busy.value) return
  busy.value = true
  nicknameError.value = ''
  formError.value = ''
  try {
    const score = await saveScore(quizId, saved.token, nickname.value)
    await router.push({
      name: 'leaderboard',
      params: { slug: score.category },
      state: { highlight: { rank: score.rank, nickname: score.nickname, points: score.points } },
    })
  } catch (error) {
    if (error.code === 'NICKNAME_INVALID' || error.code === 'VALIDATION_ERROR') {
      nicknameError.value = errorMessage(error)
    } else if (error.code === 'SCORE_ALREADY_SAVED') {
      formError.value = errorMessage(error)
      result.value = { ...result.value, score_saved: true }
    } else {
      formError.value = errorMessage(error)
    }
  } finally {
    busy.value = false
  }
}

function onSkip() {
  router.push({ name: 'leaderboard', params: { slug: saved.category.slug } })
}

async function onReplay() {
  if (busy.value) return
  busy.value = true
  formError.value = ''
  try {
    const { quizId: newId } = await quiz.start(saved.category.slug)
    await router.push({ name: 'quiz', params: { quizId: newId } })
  } catch (error) {
    formError.value = errorMessage(error)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (!saved?.token) {
    leaveToHome(t('result.notFound'))
    return
  }
  load()
})
</script>

<template>
  <section
    v-if="saved"
    class="result"
    :style="{ '--accent': `var(--neon-${saved.category.color})` }"
  >
    <p v-if="loading" class="status" role="status">{{ t('result.loading') }}</p>

    <div v-else-if="loadError" class="panel" role="alert">
      <p>{{ loadError }}</p>
      <NeonButton @click="load">{{ t('common.retry') }}</NeonButton>
    </div>

    <div v-else-if="result" class="panel">
      <p class="category">{{ result.category.name }}</p>
      <h1 class="points">{{ result.points }} <span class="unit">{{ t('common.points') }}</span></h1>
      <p class="correct">
        {{ t('result.correct', { correct: result.correct_count, total: result.total_questions }) }}
      </p>
      <p v-if="result.timed_out_count > 0" class="muted">
        {{ t('result.timedOut', { count: result.timed_out_count }) }}
      </p>
      <p v-if="result.qualifies_for_top10 && !result.score_saved" class="badge">
        {{ t('result.top10') }}
      </p>

      <p v-if="result.score_saved" class="saved" role="status">
        {{ t('result.saved') }}
      </p>

      <form v-else class="form" novalidate @submit.prevent="onSave">
        <label for="nickname">{{ t('result.nickname') }}</label>
        <input
          id="nickname"
          v-model="nickname"
          type="text"
          maxlength="16"
          autocomplete="nickname"
          :placeholder="t('result.nicknamePlaceholder')"
          :aria-invalid="nicknameError ? 'true' : 'false'"
          :aria-describedby="nicknameError ? 'nickname-error' : undefined"
        />
        <p v-if="nicknameError" id="nickname-error" class="field-error" role="alert">
          {{ nicknameError }}
        </p>
        <NeonButton type="submit" :disabled="busy">{{ t('result.save') }}</NeonButton>
      </form>

      <p v-if="formError" class="field-error" role="alert">{{ formError }}</p>

      <div class="actions">
        <button v-if="!result.score_saved" type="button" class="link" @click="onSkip">
          {{ t('result.skip') }}
        </button>
        <RouterLink
          v-else
          class="link"
          :to="{ name: 'leaderboard', params: { slug: saved.category.slug } }"
        >
          {{ t('result.leaderboard') }}
        </RouterLink>
        <button type="button" class="link" :disabled="busy" @click="onReplay">{{ t('result.replay') }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result {
  max-width: 520px;
  margin: var(--space-6) auto 0;
}

.status {
  color: var(--color-text-muted);
  text-align: center;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-6);
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  text-align: center;
}

.category {
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
}

.points {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 500;
  line-height: 1;
  text-shadow: var(--glow-sm);
}

.unit {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-shadow: none;
}

.correct {
  font-family: var(--font-mono);
  font-size: 1.125rem;
}

.muted {
  color: var(--color-text-muted);
}

.badge {
  padding: var(--space-1) var(--space-4);
  border: 2px solid var(--color-warning);
  border-radius: 999px;
  color: var(--color-warning);
  font-family: var(--font-display);
  font-weight: 700;
  box-shadow: var(--glow-sm);
}

.saved {
  color: var(--color-correct);
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-4);
  text-align: left;
}

label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

input {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
}

input:focus-visible {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 8px var(--accent);
}

input[aria-invalid='true'] {
  border-color: var(--color-wrong);
}

.field-error {
  color: var(--color-wrong);
  font-size: 0.875rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-6);
  margin-top: var(--space-2);
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.link:hover {
  color: var(--color-text);
}

.link:disabled {
  cursor: wait;
  opacity: 0.6;
}
</style>
