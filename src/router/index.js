import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Result and leaderboard routes are added in Faz 9.
const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/quiz/:quizId',
    name: 'quiz',
    component: () => import('../views/QuizView.vue'),
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
