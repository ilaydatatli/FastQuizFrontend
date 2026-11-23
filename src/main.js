import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/variables.css'
import './styles/base.css'

createApp(App).use(router).mount('#app')

// PWA: only in the built site; in `npm run dev` a service worker would get in the way.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Not installable then, but the site itself still works.
    })
  })
}
