// Test setup file
// Global test configuration and setup

import { config } from '@vue/test-utils'
import { Crypto } from '@peculiar/webcrypto'

// Set global mount options
config.global.stubs = {
  // Stub components that cause issues in tests
}

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Polyfill Web Crypto API for Node.js tests
// Required for asset-hash.ts SHA-256 hashing
const crypto = new Crypto()

// Set on both global and window (jsdom provides window)
Object.defineProperty(global, 'crypto', {
  value: crypto,
  writable: true,
  configurable: true
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'crypto', {
    value: crypto,
    writable: true,
    configurable: true
  })
}