import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Quiz, result and leaderboard routes are added in Faz 8–9.
const routes = [
  { path: '/', name: 'home', component: HomeView },
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
