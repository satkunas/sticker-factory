import { describe, it, expect } from 'vitest'
import { validateFontUrl } from '../utils/security'

describe('Security Utilities', () => {
  describe('validateFontUrl', () => {
    it('should accept trusted Google Fonts URLs', () => {
      const googleUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
      expect(validateFontUrl(googleUrl)).toBe(true)
    })

    it('should accept Google Fonts static URLs', () => {
      const staticUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2'
      expect(validateFontUrl(staticUrl)).toBe(true)
    })

    it('should reject non-HTTPS URLs', () => {
      const httpUrl = 'http://fonts.googleapis.com/css?family=Roboto'
      expect(validateFontUrl(httpUrl)).toBe(false)
    })

    it('should reject untrusted domains', () => {
      const maliciousUrl = 'https://evil.com/fonts.css'
      expect(validateFontUrl(maliciousUrl)).toBe(false)
    })

    it('should handle invalid URLs gracefully', () => {
      expect(validateFontUrl('not-a-url')).toBe(false)
      expect(validateFontUrl('')).toBe(false)
    })
  })
})
