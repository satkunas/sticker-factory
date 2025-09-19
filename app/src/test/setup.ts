// Test setup file
// Global test configuration and setup

import { config } from '@vue/test-utils'

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