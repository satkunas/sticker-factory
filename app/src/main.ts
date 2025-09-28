import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeUrlDrivenStore } from './stores/urlDrivenStore'
import './style.css'

// Initialize the unified URL-driven store
initializeUrlDrivenStore(router)

createApp(App).use(router).mount('#app')