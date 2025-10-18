// Security utilities for font URL validation
// Following behavioral guidelines: sanitize at entry points only

import { logger } from './logger'

/**
 * Validate URL for font loading
 * @param url - Font URL to validate
 * @returns {boolean} - True if URL is safe
 */
export function validateFontUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)

    // Only allow HTTPS and specific trusted domains
    if (parsedUrl.protocol !== 'https:') {
      logger.warn(`Rejected non-HTTPS font URL: ${url}`)
      return false
    }

    // Allow only trusted font providers
    const trustedDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ]

    if (!trustedDomains.some(domain => parsedUrl.hostname === domain)) {
      logger.warn(`Rejected untrusted font domain: ${parsedUrl.hostname}`)
      return false
    }

    return true

  } catch (error) {
    logger.warn(`Invalid font URL: ${url}`)
    return false
  }
}
