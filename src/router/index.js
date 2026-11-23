import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/quiz/:quizId',
    name: 'quiz',
    component: () => import('../views/QuizView.vue'),
  },
  {
    path: '/quiz/:quizId/result',
    name: 'result',
    component: () => import('../views/ResultView.vue'),
  },
  {
    path: '/room/new',
    name: 'room-new',
    component: () => import('../views/RoomNewView.vue'),
  },
  {
    path: '/room/:code',
    name: 'room',
    component: () => import('../views/RoomView.vue'),
  },
  {
    path: '/leaderboard/:slug?',
    name: 'leaderboard',
    component: () => import('../views/LeaderboardView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
