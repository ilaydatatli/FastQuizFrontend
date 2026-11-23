<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResult, saveScore } from '../api/quiz.js'
import { useI18n } from '../composables/useI18n.js'
import { motivationLines } from '../composables/motivation.js'
import { usePlayer } from '../composables/usePlayer.js'
import { errorMessage, useQuiz } from '../composables/useQuiz.js'
import NeonButton from '../components/NeonButton.vue'

const route = useRoute()
const router = useRouter()
const quiz = useQuiz()
const { t } = useI18n()
const { nickname, startEditing } = usePlayer()

// Set by QuizView when the quiz finished (see useQuiz.finish).
const saved = window.history.state?.quiz ?? null
const quizId = route.params.quizId

const loading = ref(true)
const loadError = ref('')
const result = ref(null)
// POST .../score/ response; kept in history.state so a page refresh still shows the messages.
const score = ref(window.history.state?.score ?? null)
const saving = ref(false)
const saveError = ref('')
const canRetrySave = ref(false)
const busy = ref(false)
const replayError = ref('')

const lines = computed(() => motivationLines(score.value))

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
  autoSave()
}

// The score is saved automatically under the player's nickname (Faz 22).
async function autoSave() {
  if (!result.value || result.value.score_saved || saving.value || !nickname.value) return
  saving.value = true
  saveError.value = ''
  canRetrySave.value = false
  try {
    const response = await saveScore(quizId, saved.token, nickname.value)
    score.value = response
    result.value = { ...result.value, score_saved: true }
    // The plain response, not score.value: a Vue proxy cannot be stored in history.state.
    window.history.replaceState({ ...window.history.state, score: response }, '')
  } catch (error) {
    saveError.value = errorMessage(error)
    if (error.code === 'SCORE_ALREADY_SAVED') {
      result.value = { ...result.value, score_saved: true }
      saveError.value = ''
    } else if (error.code === 'NICKNAME_INVALID' || error.code === 'VALIDATION_ERROR') {
      startEditing() // the server did not accept the name: ask for another one
    } else {
      canRetrySave.value = error.code !== 'QUIZ_EXPIRED'
    }
  } finally {
    saving.value = false
  }
}

// A first-time player may type the name only now (or fix a rejected one).
watch(nickname, autoSave)

function goToLeaderboard() {
  const state = score.value
    ? { highlight: { rank: score.value.rank, nickname: score.value.nickname, points: score.value.points } }
    : {}
  router.push({ name: 'leaderboard', params: { slug: saved.category.slug }, state })
}

async function onReplay() {
  if (busy.value) return
  busy.value = true
  replayError.value = ''
  try {
    const { quizId: newId } = await quiz.start(saved.category.slug)
    await router.push({ name: 'quiz', params: { quizId: newId } })
  } catch (error) {
    replayError.value = errorMessage(error)
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

      <div class="message" aria-live="polite">
        <p v-if="saving" class="muted">{{ t('result.saving') }}</p>
        <template v-else-if="lines.length">
          <p
            v-for="(line, i) in lines"
            :key="line.key"
            :class="i === 0 ? 'headline' : 'subline'"
          >
            {{ t(line.key, line.params) }}
          </p>
        </template>
        <p v-else-if="result.score_saved" class="saved">{{ t('result.saved') }}</p>
        <template v-else-if="saveError">
          <p class="field-error" role="alert">{{ saveError }}</p>
          <button v-if="canRetrySave" type="button" class="link" @click="autoSave">
            {{ t('common.retry') }}
          </button>
        </template>
      </div>

      <!-- Room quiz: the friends' board comes first; a room is played once, so "again" is a normal quiz. -->
      <NeonButton v-if="result?.room" @click="router.push({ name: 'room', params: { code: result.room } })">
        {{ t('room.board') }} 👥
      </NeonButton>
      <NeonButton v-else :disabled="busy" @click="onReplay">{{ t('result.replay') }}</NeonButton>
      <button v-if="result?.room" type="button" class="link" :disabled="busy" @click="onReplay">
        {{ t('result.replay') }}
      </button>
      <p v-if="replayError" class="field-error" role="alert">{{ replayError }}</p>
      <button type="button" class="link" @click="goToLeaderboard">{{ t('result.leaderboard') }}</button>
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


.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  min-height: 3.5rem; /* no jump when "saving…" turns into the messages */
  margin: var(--space-2) 0;
}

.headline {
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}

.subline {
  color: var(--color-text);
}

.saved {
  color: var(--color-correct);
  font-weight: 600;
}


.field-error {
  color: var(--color-wrong);
  font-size: 0.875rem;
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

</style>
