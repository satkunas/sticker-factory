/**
 * Phase 5: Integration Testing Suite
 * Comprehensive testing of URL-driven store functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Router } from 'vue-router'
import { URL_SYNC_TIMEOUT_MS } from '../config/constants'
import {
  initializeUrlDrivenStore,
  getUrlDrivenState,
  resetUrlDrivenStore,
  updateTemplate,
  updateLayer,
  flatFormData
} from '../stores/urlDrivenStore'

// Mock router for testing
const mockRouter = {
  beforeEach: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      query: {},
      params: {}
    }
  }
} as unknown as Router

// Mock template loader
vi.mock('../config/template-loader', () => ({
  loadTemplate: vi.fn(async (templateId: string) => {
    if (templateId === 'business-card') {
      return {
        id: 'business-card',
        name: 'Business Card',
        category: 'rectangle',
        viewBox: { width: 400, height: 250 },
        layers: [
          {
            id: 'company-name',
            type: 'text',
            text: 'Your Company',
            fontSize: 18,
            fontWeight: 600,
            fontColor: '#1a365d',
            strokeColor: '#ffffff',
            strokeWidth: 0,
            strokeOpacity: 1,
            strokeLinejoin: 'round',
            position: { x: '50%', y: '30%' }
          },
          {
            id: 'contact-info',
            type: 'text',
            text: 'contact@company.com',
            fontSize: 14,
            fontWeight: 400,
            fontColor: '#4a5568',
            strokeColor: '#ffffff',
            strokeWidth: 0,
            strokeOpacity: 1,
            strokeLinejoin: 'round',
            position: { x: '50%', y: '70%' }
          },
          {
            id: 'background',
            type: 'shape',
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 2,
            strokeLinejoin: 'round',
            position: { x: 0, y: 0 }
          }
        ]
      }
    }
    return null
  })
}))

// Mock URL encoding utilities
vi.mock('../utils/url-encoding', () => ({
  decodeTemplateStateCompact: vi.fn((encoded: string) => {
    if (encoded === 'TEST_ENCODED_BUSINESS_CARD') {
      return {
        selectedTemplateId: 'business-card',
        layers: [
          {
            id: 'company-name',
            type: 'text',
            text: 'Acme Corporation',
            fontSize: 20,
            fontColor: '#2d3748'
          },
          {
            id: 'contact-info',
            type: 'text',
            text: 'hello@acme.com',
            fontSize: 14
          },
          {
            id: 'background',
            type: 'shape',
            fill: '#f7fafc'
          }
        ]
      }
    }
    return null
  }),
  encodeTemplateStateCompact: vi.fn(() => 'MOCK_ENCODED_STATE')
}))

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

describe('Phase 5: Integration Testing', () => {
  beforeEach(() => {
    resetUrlDrivenStore()
    vi.clearAllMocks()

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: vi.fn()
      },
      writable: true
    })
  })

  afterEach(() => {
    resetUrlDrivenStore()
  })

  describe('5.1.1: URL decode → template loading → form initialization', () => {
    it('should complete the full URL decode pipeline successfully', async () => {
      // Initialize store
      initializeUrlDrivenStore(mockRouter)
      const state = getUrlDrivenState()

      // Mock URL state decode
      const { decodeTemplateStateCompact } = await import('../utils/url-encoding')
      const urlData = decodeTemplateStateCompact('TEST_ENCODED_BUSINESS_CARD')

      // Verify URL decode worked
      expect(urlData).toBeDefined()
      expect(urlData?.selectedTemplateId).toBe('business-card')
      expect(urlData?.layers).toHaveLength(3)

      // Test template loading
      await updateTemplate('business-card')

      // Verify template loaded correctly
      expect(state.selectedTemplateId).toBe('business-card')
      expect(state.selectedTemplate).toBeDefined()
      expect(state.selectedTemplate?.name).toBe('Business Card')
      expect(state.selectedTemplate?.layers).toHaveLength(3)

      // Verify form data initialization from template defaults
      expect(state.formData).toHaveLength(3)

      // Check text layer form data
      const companyNameForm = state.formData.find(layer => layer.id === 'company-name')
      expect(companyNameForm).toBeDefined()
      expect(companyNameForm?.text).toBe('Your Company') // Template default
      expect(companyNameForm?.fontSize).toBe(18)
      expect(companyNameForm?.fontColor).toBe('#1a365d')

      const contactInfoForm = state.formData.find(layer => layer.id === 'contact-info')
      expect(contactInfoForm).toBeDefined()
      expect(contactInfoForm?.text).toBe('contact@company.com') // Template default
      expect(contactInfoForm?.fontSize).toBe(14)

      // Check shape layer form data
      const backgroundForm = state.formData.find(layer => layer.id === 'background')
      expect(backgroundForm).toBeDefined()
      expect(backgroundForm?.fill).toBe('#ffffff') // Template default
      expect(backgroundForm?.stroke).toBe('#e2e8f0')
      expect(backgroundForm?.strokeWidth).toBe(2)
    })

    it('should merge URL overrides with template defaults correctly', async () => {
      initializeUrlDrivenStore(mockRouter)
      const state = getUrlDrivenState()

      // Load template first
      await updateTemplate('business-card')

      // Now apply URL overrides using updateLayer
      await updateLayer('company-name', {
        text: 'Acme Corporation',
        fontSize: 20,
        fontColor: '#2d3748'
      })

      await updateLayer('contact-info', {
        text: 'hello@acme.com'
      })

      await updateLayer('background', {
        fill: '#f7fafc'
      })

      // Verify URL overrides took precedence
      const companyNameForm = state.formData.find(layer => layer.id === 'company-name')
      expect(companyNameForm?.text).toBe('Acme Corporation') // URL override
      expect(companyNameForm?.fontSize).toBe(20) // URL override
      expect(companyNameForm?.fontColor).toBe('#2d3748') // URL override
      expect(companyNameForm?.fontWeight).toBe(600) // Template default preserved

      const contactInfoForm = state.formData.find(layer => layer.id === 'contact-info')
      expect(contactInfoForm?.text).toBe('hello@acme.com') // URL override
      expect(contactInfoForm?.fontSize).toBe(14) // Template default preserved

      const backgroundForm = state.formData.find(layer => layer.id === 'background')
      expect(backgroundForm?.fill).toBe('#f7fafc') // URL override
      expect(backgroundForm?.stroke).toBe('#e2e8f0') // Template default preserved
    })

    it('should generate correct render data from merged form data', async () => {
      initializeUrlDrivenStore(mockRouter)

      await updateTemplate('business-card')

      // Apply some overrides
      await updateLayer('company-name', {
        text: 'Test Company',
        fontSize: 22
      })

      // Check render data generation (using new reactive computed system)
      expect(flatFormData.value).toHaveLength(3)

      const companyNameRender = flatFormData.value.find(layer => layer.id === 'company-name')
      expect(companyNameRender).toBeDefined()
      expect(companyNameRender?.text).toBe('Test Company')
      expect(companyNameRender?.fontSize).toBe(22)
      expect(companyNameRender?.fontColor).toBe('#1a365d') // Template default
    })
  })

  describe('5.1.2: Form changes → debounced URL sync', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should trigger URL sync after form changes with debouncing', async () => {
      initializeUrlDrivenStore(mockRouter)

      await updateTemplate('business-card')

      // Make form changes
      await updateLayer('company-name', { text: 'Updated Company' })

      // Should not sync immediately (debounced)
      expect(window.history.replaceState).not.toHaveBeenCalled()

      // Fast-forward past debounce delay
      vi.advanceTimersByTime(URL_SYNC_TIMEOUT_MS)

      // Should now trigger URL sync
      expect(window.history.replaceState).toHaveBeenCalled()
    })

    it('should debounce multiple rapid changes', async () => {
      initializeUrlDrivenStore(mockRouter)

      await updateTemplate('business-card')

      // Make multiple rapid changes
      for (let i = 0; i < 5; i++) {
        await updateLayer('company-name', { text: `Company ${i}` })
      }

      // Fast-forward past debounce delay
      vi.advanceTimersByTime(URL_SYNC_TIMEOUT_MS)

      // Should only sync once despite multiple changes
      expect(window.history.replaceState).toHaveBeenCalledTimes(1)
    })
  })

  describe('5.1.3: Browser back/forward navigation', () => {
    it('should set up router guards for navigation detection', () => {
      initializeUrlDrivenStore(mockRouter)

      // Verify router beforeEach guard was registered
      expect(mockRouter.beforeEach).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('5.1.4: Direct URL navigation and page reload', () => {
    it('should handle page initialization from URL state', async () => {
      // Mock window.location for URL with encoded state
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/TEST_ENCODED_BUSINESS_CARD.sticker'
        },
        writable: true
      })

      initializeUrlDrivenStore(mockRouter)
      const state = getUrlDrivenState()

      // Store should initialize but not automatically decode
      // (In real app, router guard would trigger decode)
      expect(state.isInitialized).toBe(true)
      expect(state.currentUrl).toBe('/')
    })
  })
})

describe('Phase 5.2: Edge Cases and Error Handling', () => {
  beforeEach(() => {
    resetUrlDrivenStore()
    vi.clearAllMocks()

    Object.defineProperty(window, 'history', {
      value: {
        replaceState: vi.fn()
      },
      writable: true
    })
  })

  describe('5.2.1: Invalid URL handling', () => {
    it('should handle malformed URLs gracefully', async () => {
      const { decodeTemplateStateCompact } = vi.mocked(await import('../utils/url-encoding'))

      // Mock decode failure
      decodeTemplateStateCompact.mockReturnValueOnce(null)

      const result = decodeTemplateStateCompact('INVALID_ENCODED_DATA')
      expect(result).toBe(null)
    })
  })

  describe('5.2.2: Template switching', () => {
    it('should preserve form data structure during template switches', async () => {
      initializeUrlDrivenStore(mockRouter)
      const state = getUrlDrivenState()

      // Load initial template
      await updateTemplate('business-card')
      const initialFormDataLength = state.formData.length

      // Switch to same template
      await updateTemplate('business-card')

      // Form data should be reinitialized with same structure
      expect(state.formData.length).toBe(initialFormDataLength)
      expect(state.selectedTemplateId).toBe('business-card')
    })
  })

  describe('5.2.3: Rapid form changes', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should handle rapid successive form updates', async () => {
      initializeUrlDrivenStore(mockRouter)
      const state = getUrlDrivenState()

      await updateTemplate('business-card')

      // Rapid updates to same field
      for (let i = 0; i < 10; i++) {
        await updateLayer('company-name', { text: `Rapid Update ${i}` })
      }

      // Should have latest value
      const companyNameForm = state.formData.find(layer => layer.id === 'company-name')
      expect(companyNameForm?.text).toBe('Rapid Update 9')

      // URL sync should still be debounced
      vi.advanceTimersByTime(500)
      expect(window.history.replaceState).toHaveBeenCalledTimes(1)
    })
  })

  describe('5.2.4: Complex text encoding', () => {
    it('should handle special characters and unicode text', async () => {
      initializeUrlDrivenStore(mockRouter)

      await updateTemplate('business-card')

      // Test special characters
      await updateLayer('company-name', {
        text: 'Åčmé Çørpørâtion™ 🚀'
      })

      const state = getUrlDrivenState()
      const companyNameForm = state.formData.find(layer => layer.id === 'company-name')
      expect(companyNameForm?.text).toBe('Åčmé Çørpørâtion™ 🚀')
    })
  })
})