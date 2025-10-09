import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    component: () => import('../App.vue'),
    beforeEnter: (to) => {
      // CRITICAL: Let Service Worker handle .svg URLs
      // Without this, router captures .svg before Service Worker can intercept
      if (to.path.endsWith('.svg')) {
        return false // Prevent router from handling this
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router