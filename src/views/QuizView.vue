<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { errorMessage, useQuiz } from '../composables/useQuiz.js'
import NeonButton from '../components/NeonButton.vue'
import QuestionCard from '../components/QuestionCard.vue'
import QuizHeader from '../components/QuizHeader.vue'
import TimerBar from '../components/TimerBar.vue'

const FEEDBACK_MS = 700
const LEAVE_WARNING = "Quiz'den çıkarsan bu deneme yarım kalır. Çıkmak istiyor musun?"
const NO_QUIZ_NOTICE = 'Bu quiz bulunamadı. Yeni bir quiz başlatabilirsin.'

const route = useRoute()
const router = useRouter()
const quiz = useQuiz()

const status = ref('loading') // loading | playing | error
const errorText = ref('')
const question = ref(null)
const position = ref(0)
const total = ref(20)
const points = ref(0)
const remainingMs = ref(0)
const timeLimitMs = ref(5000)
const isLocked = ref(false) // single lock shared by click, keyboard and timer
const selectedId = ref(null)
const correctId = ref(null)
const timedOut = ref(false)

let feedbackTimer = null
let allowLeave = false

const category = computed(() => quiz.active.value?.category ?? { name: '', color: 'cyan' })

function applyCurrent(data) {
  total.value = data.total_questions
  points.value = data.points
  position.value = data.position
  if (data.status === 'finished' || !data.question) {
    finish()
    return
  }
  question.value = data.question
  remainingMs.value = data.remaining_ms
  timeLimitMs.value = data.time_limit_ms
  selectedId.value = null
  correctId.value = null
  timedOut.value = false
  isLocked.value = false
  status.value = 'playing'
}

async function loadCurrent() {
  try {
    applyCurrent(await quiz.current())
  } catch (error) {
    handleError(error)
  }
}

// Quiz over: clear sessionStorage and show the result (token travels in history state).
function finish() {
  allowLeave = true
  router.replace({
    name: 'result',
    params: { quizId: route.params.quizId },
    state: { quiz: quiz.finish() },
  })
}

function leaveToHome(notice) {
  allowLeave = true
  quiz.clear()
  router.replace({ name: 'home', state: notice ? { notice } : undefined })
}

function handleError(error) {
  switch (error.code) {
    case 'QUIZ_EXPIRED':
    case 'INVALID_TOKEN':
    case 'QUIZ_NOT_FOUND':
      leaveToHome(error.message)
      return
    case 'QUESTION_MISMATCH':
    case 'QUESTION_NOT_SHOWN':
    case 'ALREADY_ANSWERED':
    case 'QUIZ_FINISHED':
      // Out of sync with the server: quietly ask where we are.
      loadCurrent()
      return
    default:
      errorText.value = errorMessage(error)
      status.value = 'error'
  }
}

async function submit(choiceId) {
  try {
    const result = await quiz.answer(question.value.id, choiceId)
    correctId.value = result.correct_choice_id
    timedOut.value = result.timed_out
    points.value = result.points
    feedbackTimer = setTimeout(() => {
      feedbackTimer = null
      if (result.finished) finish()
      else loadCurrent()
    }, FEEDBACK_MS)
  } catch (error) {
    handleError(error)
  }
}

function choose(choiceId) {
  if (isLocked.value || status.value !== 'playing') return
  isLocked.value = true
  selectedId.value = choiceId
  submit(choiceId)
}

function onExpire() {
  if (isLocked.value || status.value !== 'playing') return
  isLocked.value = true
  timedOut.value = true
  submit(null)
}

function onKeydown(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
  const n = Number(event.key)
  if (!Number.isInteger(n) || n < 1 || n > 4) return
  const choice = question.value?.choices[n - 1]
  if (!choice) return
  event.preventDefault()
  choose(choice.id)
}

function retry() {
  status.value = 'loading'
  loadCurrent()
}

onMounted(() => {
  const active = quiz.active.value
  if (!active || active.quizId !== route.params.quizId) {
    leaveToHome(NO_QUIZ_NOTICE)
    return
  }
  window.addEventListener('keydown', onKeydown)
  loadCurrent()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(feedbackTimer)
})

onBeforeRouteLeave(() => {
  if (allowLeave || status.value !== 'playing') return true
  const ok = window.confirm(LEAVE_WARNING)
  if (ok) quiz.clear()
  return ok
})
</script>

<template>
  <section class="quiz" :style="{ '--accent': `var(--neon-${category.color})` }">
    <p v-if="status === 'loading'" class="status" role="status">Soru yükleniyor…</p>

    <div v-else-if="status === 'error'" class="panel error" role="alert">
      <p>{{ errorText }}</p>
      <NeonButton @click="retry">Tekrar dene</NeonButton>
    </div>

    <template v-else>
      <QuizHeader
        :category-name="category.name"
        :number="position + 1"
        :total="total"
        :points="points"
      />
      <TimerBar
        :key="question.id"
        :duration-ms="remainingMs"
        :total-ms="timeLimitMs"
        :color="category.color"
        :stopped="isLocked"
        @expire="onExpire"
      />
      <p v-if="timedOut" class="badge" role="status">Süre doldu!</p>
      <QuestionCard
        :question="question"
        :selected-id="selectedId"
        :correct-id="correctId"
        :locked="isLocked"
        @choose="choose"
      />
    </template>
  </section>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 760px;
  margin: var(--space-4) auto 0;
}

.status {
  color: var(--color-text-muted);
  text-align: center;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-6);
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  text-align: center;
}

.error {
  border-color: var(--color-wrong);
}

.badge {
  align-self: center;
  padding: var(--space-1) var(--space-4);
  border: 2px solid var(--color-wrong);
  border-radius: 999px;
  color: var(--color-wrong);
  font-family: var(--font-display);
  font-weight: 700;
}
</style>
