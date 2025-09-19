// Environment-based logging utility
// Only logs in development mode, silent in production

const IS_DEVELOPMENT = import.meta.env.DEV || import.meta.env.MODE === 'development'

interface Logger {
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  debug: (message: string, ...args: any[]) => void
  time: (label: string) => void
  timeEnd: (label: string) => void
  performance: (operation: string, duration: number, metadata?: any) => void
  api: (method: string, endpoint: string, status: number, duration: number) => void
  memory: (operation: string, before: number, after: number) => void
}

export const logger: Logger = {
  info: (message: string, ...args: any[]) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, ...args)
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },

  time: (label: string) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.time(`[TIMER] ${label}`)
    }
  },

  timeEnd: (label: string) => {
    if (IS_DEVELOPMENT) {
      // eslint-disable-next-line no-console
      console.timeEnd(`[TIMER] ${label}`)
    }
  },

  performance: (operation: string, duration: number, metadata?: any) => {
    if (IS_DEVELOPMENT) {
      const message = `[PERF] ${operation} - ${duration.toFixed(2)}ms`
      if (metadata) {
        // eslint-disable-next-line no-console
        console.info(message, metadata)
      } else {
        // eslint-disable-next-line no-console
        console.info(message)
      }
    }
  },

  api: (method: string, endpoint: string, status: number, duration: number) => {
    if (IS_DEVELOPMENT) {
      const statusColor = status < 400 ? '✅' : '❌'
      // eslint-disable-next-line no-console
      console.info(`[API] ${statusColor} ${method} ${endpoint} - ${status} - ${duration.toFixed(3)}ms`)
    }
  },

  memory: (operation: string, before: number, after: number) => {
    if (IS_DEVELOPMENT) {
      const diff = after - before
      const diffMB = (diff / (1024 * 1024)).toFixed(2)
      const sign = diff >= 0 ? '+' : ''
      // eslint-disable-next-line no-console
      console.info(`[MEMORY] ${operation} - ${sign}${diffMB}MB (${(before / (1024 * 1024)).toFixed(1)}MB → ${(after / (1024 * 1024)).toFixed(1)}MB)`)
    }
  }
}

// Production-safe error handler for critical errors that should always be reported
export const reportCriticalError = (error: Error | string, context?: string) => {
  // In production, this could send to error reporting service
  // For now, we'll use console.error even in production for critical errors
  const errorMessage = error instanceof Error ? error.message : error
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage

  // eslint-disable-next-line no-console
  console.error('[CRITICAL]', fullMessage)

  if (error instanceof Error && IS_DEVELOPMENT) {
    // eslint-disable-next-line no-console
    console.error('[CRITICAL STACK]', error.stack)
  }
}

// Performance monitoring utilities
export const createPerformanceTimer = (operation: string) => {
  const startTime = performance.now()
  const memoryBefore = getMemoryUsage()

  return {
    end: (metadata?: any) => {
      const duration = performance.now() - startTime
      const memoryAfter = getMemoryUsage()

      logger.performance(operation, duration, metadata)
      if (memoryAfter !== memoryBefore) {
        logger.memory(operation, memoryBefore, memoryAfter)
      }

      return { duration, memoryBefore, memoryAfter }
    }
  }
}

// Get current memory usage (if available)
export const getMemoryUsage = (): number => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const memory = (performance as any).memory
    if (memory && memory.usedJSHeapSize) {
      return memory.usedJSHeapSize
    }
  }
  return 0
}

// Batch logging for operations with multiple steps
export const createBatchLogger = (operationName: string) => {
  const logs: Array<{ step: string; duration: number; metadata?: any }> = []
  let lastStepTime = performance.now()

  return {
    step: (stepName: string, metadata?: any) => {
      const now = performance.now()
      const duration = now - lastStepTime
      logs.push({ step: stepName, duration, metadata })
      lastStepTime = now
    },

    finish: () => {
      const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
      logger.performance(`${operationName} (total)`, totalDuration, {
        steps: logs.length,
        breakdown: logs.map(log => ({
          step: log.step,
          duration: `${log.duration.toFixed(2)}ms`,
          metadata: log.metadata
        }))
      })
      return { totalDuration, steps: logs }
    }
  }
}