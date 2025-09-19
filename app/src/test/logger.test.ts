import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  logger,
  createPerformanceTimer,
  getMemoryUsage,
  createBatchLogger
} from '../utils/logger'

// Mock console methods
const originalConsole = { ...console }

describe('Enhanced Logger', () => {
  beforeEach(() => {
    // Reset console mocks
    vi.clearAllMocks()

    // Mock console methods
    console.info = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.debug = vi.fn()
    console.time = vi.fn()
    console.timeEnd = vi.fn()
  })

  afterEach(() => {
    // Restore original console
    Object.assign(console, originalConsole)
  })

  describe('logger basic functionality', () => {
    it('should have all required methods', () => {
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.time).toBe('function')
      expect(typeof logger.timeEnd).toBe('function')
      expect(typeof logger.performance).toBe('function')
      expect(typeof logger.api).toBe('function')
      expect(typeof logger.memory).toBe('function')
    })

    it('should format performance logs correctly', () => {
      logger.performance('Test Operation', 123.456, { test: true })

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          '[PERF] Test Operation - 123.46ms',
          { test: true }
        )
      }
    })

    it('should format API logs correctly', () => {
      logger.api('GET', '/api/templates', 200, 45.123)

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          '[API] ✅ GET /api/templates - 200 - 45.123ms'
        )
      }
    })

    it('should format API error logs correctly', () => {
      logger.api('POST', '/api/save', 500, 1234.567)

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          '[API] ❌ POST /api/save - 500 - 1234.567ms'
        )
      }
    })

    it('should format memory logs correctly', () => {
      const before = 100 * 1024 * 1024 // 100MB
      const after = 150 * 1024 * 1024  // 150MB

      logger.memory('Large Operation', before, after)

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          '[MEMORY] Large Operation - +50.00MB (100.0MB → 150.0MB)'
        )
      }
    })

    it('should handle memory decrease correctly', () => {
      const before = 200 * 1024 * 1024 // 200MB
      const after = 150 * 1024 * 1024  // 150MB

      logger.memory('Cleanup Operation', before, after)

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          '[MEMORY] Cleanup Operation - -50.00MB (200.0MB → 150.0MB)'
        )
      }
    })
  })

  describe('createPerformanceTimer', () => {
    it('should create a timer with end method', () => {
      const timer = createPerformanceTimer('Test Timer')

      expect(timer).toHaveProperty('end')
      expect(typeof timer.end).toBe('function')
    })

    it('should measure performance duration', () => {
      const timer = createPerformanceTimer('Test Timer')

      // Simulate some work
      const start = performance.now()
      while (performance.now() - start < 1) {
        // Wait at least 1ms
      }

      const result = timer.end({ test: 'metadata' })

      expect(result).toHaveProperty('duration')
      expect(result.duration).toBeGreaterThan(0)
      expect(result).toHaveProperty('memoryBefore')
      expect(result).toHaveProperty('memoryAfter')
    })

    it('should log performance with metadata', () => {
      const timer = createPerformanceTimer('Test Timer')
      const metadata = { items: 5, cached: true }

      timer.end(metadata)

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining('[PERF] Test Timer'),
          metadata
        )
      }
    })
  })

  describe('getMemoryUsage', () => {
    it('should return a number', () => {
      const usage = getMemoryUsage()
      expect(typeof usage).toBe('number')
      expect(usage).toBeGreaterThanOrEqual(0)
    })

    it('should handle missing performance.memory gracefully', () => {
      const originalPerformance = global.performance

      // Mock performance without memory
      global.performance = {} as any

      const usage = getMemoryUsage()
      expect(usage).toBe(0)

      // Restore
      global.performance = originalPerformance
    })
  })

  describe('createBatchLogger', () => {
    it('should create a batch logger with step and finish methods', () => {
      const batchLogger = createBatchLogger('Batch Operation')

      expect(batchLogger).toHaveProperty('step')
      expect(batchLogger).toHaveProperty('finish')
      expect(typeof batchLogger.step).toBe('function')
      expect(typeof batchLogger.finish).toBe('function')
    })

    it('should track multiple steps', () => {
      const batchLogger = createBatchLogger('Multi-step Operation')

      batchLogger.step('Step 1', { items: 10 })
      batchLogger.step('Step 2', { items: 20 })
      batchLogger.step('Step 3')

      const result = batchLogger.finish()

      expect(result).toHaveProperty('totalDuration')
      expect(result).toHaveProperty('steps')
      expect(result.steps).toHaveLength(3)
      expect(result.totalDuration).toBeGreaterThan(0)
    })

    it('should log batch summary with breakdown', () => {
      const batchLogger = createBatchLogger('Test Batch')

      batchLogger.step('Phase 1')
      batchLogger.step('Phase 2')

      batchLogger.finish()

      if (import.meta.env.DEV) {
        expect(console.info).toHaveBeenCalledWith(
          expect.stringContaining('[PERF] Test Batch (total)'),
          expect.objectContaining({
            steps: 2,
            breakdown: expect.arrayContaining([
              expect.objectContaining({
                step: 'Phase 1',
                duration: expect.stringMatching(/\d+\.\d+ms/)
              }),
              expect.objectContaining({
                step: 'Phase 2',
                duration: expect.stringMatching(/\d+\.\d+ms/)
              })
            ])
          })
        )
      }
    })
  })

  describe('production mode behavior', () => {
    it('should not log in production mode', () => {
      // This test would need to be run with NODE_ENV=production
      // For now, we can test the development behavior
      if (!import.meta.env.DEV) {
        logger.info('Should not appear in production')
        logger.performance('Production test', 100)

        expect(console.info).not.toHaveBeenCalled()
      }
    })
  })
})