import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeUrlDrivenStore } from './stores/urlDrivenStore'
import { logger } from './utils/logger'
import './style.css'

// Initialize the unified URL-driven store
initializeUrlDrivenStore(router)

// Register Service Worker for .svg URL handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.DEV ? '/sw-bundle.js' : '/sw-bundle.js'
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        logger.info('Service Worker registered:', registration.scope)
      })
      .catch((error) => {
        logger.error('Service Worker registration failed:', error)
      })
  })
}

createApp(App).use(router).mount('#app')