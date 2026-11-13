// All API calls go through this file. Names follow PROJE.md Section 6 "Akış özeti".
import { apiFetch } from './client.js'

const enc = encodeURIComponent

export function getCategories() {
  return apiFetch('/categories/')
}

export function startQuiz(categorySlug) {
  return apiFetch('/quizzes/', { method: 'POST', body: { category: categorySlug } })
}

export function getCurrent(quizId, token) {
  return apiFetch(`/quizzes/${enc(quizId)}/current/`, { token })
}

// choiceId is null when the timer ran out on the client.
export function submitAnswer(quizId, token, questionId, choiceId) {
  return apiFetch(`/quizzes/${enc(quizId)}/answers/`, {
    method: 'POST',
    token,
    body: { question_id: questionId, choice_id: choiceId },
  })
}

export function getResult(quizId, token) {
  return apiFetch(`/quizzes/${enc(quizId)}/result/`, { token })
}

export function saveScore(quizId, token, nickname) {
  return apiFetch(`/quizzes/${enc(quizId)}/score/`, { method: 'POST', token, body: { nickname } })
}

export function getLeaderboard(categorySlug) {
  return apiFetch(`/leaderboard/${enc(categorySlug)}/`)
}
