import { ref } from 'vue'
import { getCurrent, joinRoom, startQuiz, submitAnswer } from '../api/quiz.js'
import { translate, useI18n } from './useI18n.js'

const STORAGE_KEY = 'fastquiz.active'

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

// The text the UI shows for an ApiError, in the current language, chosen by `code`.
// The server's Turkish `message` is only a fallback for codes the dictionary does not know.
export function errorMessage(error, language = useI18n().locale.value) {
  const code = error?.status === 429 ? 'RATE_LIMITED' : error?.code
  const key = `errors.${code}`
  const text = translate(language, key)
  if (text !== key) return text
  return error?.message || translate(language, 'errors.UNKNOWN_ERROR')
}

export function useQuiz() {
  const active = ref(readActive())

  function remember(data) {
    const value = { quizId: data.quiz_id, token: data.token, category: data.category }
    writeActive(value)
    active.value = value
    return value
  }

  async function start(categorySlug) {
    return remember(await startQuiz(categorySlug, useI18n().locale.value))
  }

  // Room quiz: the room's questions, in the player's own language.
  async function startRoom(code, nickname) {
    return remember(await joinRoom(code, nickname, useI18n().locale.value))
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

  // Quiz is over: drop it from sessionStorage and hand back what the result
  // screen still needs. It travels in that history entry's state (same tab only),
  // so refreshing the result page or coming back to it with the back button works.
  function finish() {
    const { token, category } = active.value
    clear()
    return { token, category: { slug: category.slug, name: category.name, color: category.color } }
  }

  return { active, start, startRoom, current, answer, clear, finish }
}
