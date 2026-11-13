import { ref } from 'vue'
import { getCurrent, startQuiz, submitAnswer } from '../api/quiz.js'

const STORAGE_KEY = 'fastquiz.active'
const RATE_LIMIT_MESSAGE = 'Biraz yavaşla, birazdan tekrar dene.'

// sessionStorage (not localStorage): closing the tab should end the quiz.
function readActive() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeActive(value) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be blocked (private mode); the quiz still works until a refresh.
  }
}

// The text the UI shows for an ApiError.
export function errorMessage(error) {
  if (error?.status === 429) return RATE_LIMIT_MESSAGE
  return error?.message || 'Beklenmeyen bir hata oluştu.'
}

export function useQuiz() {
  const active = ref(readActive())

  async function start(categorySlug) {
    const data = await startQuiz(categorySlug)
    const value = { quizId: data.quiz_id, token: data.token, category: data.category }
    writeActive(value)
    active.value = value
    return value
  }

  function current() {
    return getCurrent(active.value.quizId, active.value.token)
  }

  function answer(questionId, choiceId) {
    return submitAnswer(active.value.quizId, active.value.token, questionId, choiceId)
  }

  function clear() {
    writeActive(null)
    active.value = null
  }

  return { active, start, current, answer, clear }
}
