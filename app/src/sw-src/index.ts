/* eslint-env serviceworker */
/* eslint-disable no-undef */
/**
 * Service Worker Entry Point
 * ==========================
 *
 * Intercepts .svg URL requests and generates SVG content on-the-fly
 */

import { handleSvgRequest } from './svg-handler'
import { logger } from '../utils/logger'

declare const self: ServiceWorkerGlobalScope

// Service Worker install event
self.addEventListener('install', (event) => {
  logger.info('Service Worker installing...')
  // Skip waiting to activate immediately
  event.waitUntil(self.skipWaiting())
})

// Service Worker activate event
self.addEventListener('activate', (event) => {
  logger.info('Service Worker activated')
  // Claim clients immediately
  event.waitUntil(self.clients.claim())
})

// Service Worker fetch event - intercept .svg requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Match pattern: /{encodedState}.svg (not /images/*.svg or other paths)
  if (url.pathname.match(/^\/[A-Za-z0-9_-]+\.svg$/)) {
    logger.debug('Intercepting SVG request:', url.pathname)
    event.respondWith(handleSvgRequest(url, event.request))
    return
  }

  // Pass through all other requests
  event.respondWith(fetch(event.request))
})
