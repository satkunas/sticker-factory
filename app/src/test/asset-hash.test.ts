/* global TextEncoder */
/**
 * Asset Hashing Utility Tests
 *
 * Target: 100% coverage (utility file)
 * Tests deterministic hashing, ID generation, and validation
 */

import { describe, it, expect } from 'vitest'
import {
  ASSET_TYPE_PREFIX,
  ASSET_HASH_LENGTH,
  normalizeSvgForHashing,
  normalizeFontForHashing,
  generateAssetHash,
  createAssetId,
  isUserAssetId,
  isUserSvgId,
  isUserFontId,
  extractHashFromAssetId,
  validateAssetHash,
  generateAssetId
} from '../utils/asset-hash'

describe('asset-hash', () => {
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" /></svg>'

  describe('Constants', () => {
    it('should export ASSET_TYPE_PREFIX', () => {
      expect(ASSET_TYPE_PREFIX.SVG).toBe('user-svg-')
      expect(ASSET_TYPE_PREFIX.FONT).toBe('user-font-')
    })

    it('should export ASSET_HASH_LENGTH', () => {
      expect(ASSET_HASH_LENGTH).toBe(8)
    })
  })

  describe('normalizeSvgForHashing', () => {
    it('should remove whitespace between tags', () => {
      const svg = '<svg>  <circle />  </svg>'
      const result = normalizeSvgForHashing(svg)
      expect(result).toBe('<svg><circle /></svg>')
    })

    it('should normalize internal whitespace to single space', () => {
      const svg = '<svg   id="test"    ><circle /></svg>'
      const result = normalizeSvgForHashing(svg)
      expect(result).toBe('<svg id="test"><circle /></svg>')
    })

    it('should remove spaces around equals signs', () => {
      const svg = '<svg id = "test" class = "foo"></svg>'
      const result = normalizeSvgForHashing(svg)
      expect(result).toBe('<svg id="test" class="foo"></svg>')
    })

    it('should remove HTML comments', () => {
      const svg = '<svg><!-- comment --><circle /></svg>'
      const result = normalizeSvgForHashing(svg)
      expect(result).toBe('<svg><circle /></svg>')
    })

    it('should remove multiline comments', () => {
      const svg = `<svg>
        <!-- multi
        line
        comment -->
        <circle />
      </svg>`
      const result = normalizeSvgForHashing(svg)
      expect(result).not.toContain('<!--')
      expect(result).toContain('<circle />')
    })

    it('should trim leading/trailing whitespace', () => {
      const svg = '  <svg><circle /></svg>  '
      const result = normalizeSvgForHashing(svg)
      expect(result).toBe('<svg><circle /></svg>')
    })

    it('should produce same hash for equivalent content', () => {
      const svg1 = '<svg><circle cx="50" cy="50" r="40" /></svg>'
      const svg2 = '<svg>  <circle   cx="50"  cy="50"  r="40"  />  </svg>'
      const normalized1 = normalizeSvgForHashing(svg1)
      const normalized2 = normalizeSvgForHashing(svg2)
      expect(normalized1).toBe(normalized2)
    })
  })

  describe('normalizeFontForHashing', () => {
    it('should return font data unchanged (binary)', () => {
      const buffer = new ArrayBuffer(100)
      const result = normalizeFontForHashing(buffer)
      expect(result).toBe(buffer)
    })
  })

  describe('generateAssetHash', () => {
    it('should generate 8-character hash from string', async () => {
      const hash = await generateAssetHash(validSvg)
      expect(hash).toHaveLength(ASSET_HASH_LENGTH)
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })

    it('should generate 8-character hash from ArrayBuffer', async () => {
      const buffer = new TextEncoder().encode(validSvg)
      const hash = await generateAssetHash(buffer)
      expect(hash).toHaveLength(ASSET_HASH_LENGTH)
      expect(hash).toMatch(/^[0-9a-f]{8}$/)
    })

    it('should be deterministic (same input = same hash)', async () => {
      const hash1 = await generateAssetHash(validSvg)
      const hash2 = await generateAssetHash(validSvg)
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different content', async () => {
      const svg1 = '<svg><circle r="10" /></svg>'
      const svg2 = '<svg><circle r="20" /></svg>'
      const hash1 = await generateAssetHash(svg1)
      const hash2 = await generateAssetHash(svg2)
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty string', async () => {
      const hash = await generateAssetHash('')
      expect(hash).toHaveLength(ASSET_HASH_LENGTH)
    })

    it('should handle large content', async () => {
      const largeSvg = validSvg.repeat(1000)
      const hash = await generateAssetHash(largeSvg)
      expect(hash).toHaveLength(ASSET_HASH_LENGTH)
    })
  })

  describe('createAssetId', () => {
    it('should create SVG asset ID with prefix', () => {
      const hash = 'a1b2c3d4'
      const id = createAssetId(hash, 'svg')
      expect(id).toBe('user-svg-a1b2c3d4')
    })

    it('should create font asset ID with prefix', () => {
      const hash = 'e5f6g7h8'
      const id = createAssetId(hash, 'font')
      expect(id).toBe('user-font-e5f6g7h8')
    })
  })

  describe('isUserAssetId', () => {
    it('should return true for user SVG ID', () => {
      expect(isUserAssetId('user-svg-a1b2c3d4')).toBe(true)
    })

    it('should return true for user font ID', () => {
      expect(isUserAssetId('user-font-e5f6g7h8')).toBe(true)
    })

    it('should return false for non-user asset ID', () => {
      expect(isUserAssetId('ui-shield')).toBe(false)
      expect(isUserAssetId('some-other-id')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUserAssetId(undefined)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isUserAssetId('')).toBe(false)
    })
  })

  describe('isUserSvgId', () => {
    it('should return true for user SVG ID', () => {
      expect(isUserSvgId('user-svg-a1b2c3d4')).toBe(true)
    })

    it('should return false for user font ID', () => {
      expect(isUserSvgId('user-font-e5f6g7h8')).toBe(false)
    })

    it('should return false for non-user asset ID', () => {
      expect(isUserSvgId('ui-shield')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUserSvgId(undefined)).toBe(false)
    })
  })

  describe('isUserFontId', () => {
    it('should return true for user font ID', () => {
      expect(isUserFontId('user-font-e5f6g7h8')).toBe(true)
    })

    it('should return false for user SVG ID', () => {
      expect(isUserFontId('user-svg-a1b2c3d4')).toBe(false)
    })

    it('should return false for non-user asset ID', () => {
      expect(isUserFontId('ui-shield')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isUserFontId(undefined)).toBe(false)
    })
  })

  describe('extractHashFromAssetId', () => {
    it('should extract hash from user SVG ID', () => {
      const hash = extractHashFromAssetId('user-svg-a1b2c3d4')
      expect(hash).toBe('a1b2c3d4')
    })

    it('should extract hash from user font ID', () => {
      const hash = extractHashFromAssetId('user-font-e5f6g7h8')
      expect(hash).toBe('e5f6g7h8')
    })

    it('should return null for non-user asset ID', () => {
      const hash = extractHashFromAssetId('ui-shield')
      expect(hash).toBeNull()
    })

    it('should return null for invalid ID', () => {
      const hash = extractHashFromAssetId('invalid-id')
      expect(hash).toBeNull()
    })

    it('should handle empty hash', () => {
      const hash = extractHashFromAssetId('user-svg-')
      expect(hash).toBe('')
    })
  })

  describe('validateAssetHash', () => {
    it('should validate matching hash for string content', async () => {
      const content = validSvg
      const hash = await generateAssetHash(content)
      const isValid = await validateAssetHash(content, hash)
      expect(isValid).toBe(true)
    })

    it('should validate matching hash for ArrayBuffer content', async () => {
      const buffer = new TextEncoder().encode(validSvg)
      const hash = await generateAssetHash(buffer)
      const isValid = await validateAssetHash(buffer, hash)
      expect(isValid).toBe(true)
    })

    it('should reject mismatched hash', async () => {
      const content = validSvg
      const wrongHash = 'ffffffff'
      const isValid = await validateAssetHash(content, wrongHash)
      expect(isValid).toBe(false)
    })

    it('should reject completely different content', async () => {
      const content1 = '<svg><circle r="10" /></svg>'
      const content2 = '<svg><circle r="20" /></svg>'
      const hash1 = await generateAssetHash(content1)
      const isValid = await validateAssetHash(content2, hash1)
      expect(isValid).toBe(false)
    })

    it('should handle empty string', async () => {
      const hash = await generateAssetHash('')
      const isValid = await validateAssetHash('', hash)
      expect(isValid).toBe(true)
    })
  })

  describe('generateAssetId', () => {
    it('should generate complete SVG asset ID from content', async () => {
      const id = await generateAssetId(validSvg, 'svg')
      expect(id).toMatch(/^user-svg-[0-9a-f]{8}$/)
    })

    it('should generate complete font asset ID from content', async () => {
      const buffer = new ArrayBuffer(100)
      const id = await generateAssetId(buffer, 'font')
      expect(id).toMatch(/^user-font-[0-9a-f]{8}$/)
    })

    it('should normalize SVG content before hashing', async () => {
      const svg1 = '<svg><circle cx="50" cy="50" r="40" /></svg>'
      const svg2 = '<svg>  <circle   cx="50"  cy="50"  r="40"  />  </svg>'
      const id1 = await generateAssetId(svg1, 'svg')
      const id2 = await generateAssetId(svg2, 'svg')
      expect(id1).toBe(id2) // Same ID despite different formatting
    })

    it('should be deterministic', async () => {
      const id1 = await generateAssetId(validSvg, 'svg')
      const id2 = await generateAssetId(validSvg, 'svg')
      expect(id1).toBe(id2)
    })

    it('should produce different IDs for different content', async () => {
      const svg1 = '<svg><circle r="10" /></svg>'
      const svg2 = '<svg><circle r="20" /></svg>'
      const id1 = await generateAssetId(svg1, 'svg')
      const id2 = await generateAssetId(svg2, 'svg')
      expect(id1).not.toBe(id2)
    })

    it('should handle large SVG content', async () => {
      const largeSvg = validSvg.repeat(1000)
      const id = await generateAssetId(largeSvg, 'svg')
      expect(id).toMatch(/^user-svg-[0-9a-f]{8}$/)
    })
  })

  describe('Cross-user URL sharing (integration)', () => {
    it('should produce same ID for same SVG uploaded by different users', async () => {
      // User 1 uploads SVG
      const user1Svg = '<svg><circle cx="50" cy="50" r="40" fill="blue" /></svg>'
      const user1Id = await generateAssetId(user1Svg, 'svg')

      // User 2 uploads identical SVG (maybe formatted differently)
      const user2Svg = '<svg>  <circle cx="50" cy="50" r="40" fill="blue" />  </svg>'
      const user2Id = await generateAssetId(user2Svg, 'svg')

      // Should produce same ID (deterministic)
      expect(user1Id).toBe(user2Id)
    })

    it('should validate hash when loading from URL', async () => {
      const svg = '<svg><circle cx="50" cy="50" r="40" /></svg>'
      const id = await generateAssetId(svg, 'svg')
      const hash = extractHashFromAssetId(id)

      // User has the ID from URL
      expect(hash).toBeTruthy()

      // User uploads file - validate it matches
      const isValid = await validateAssetHash(svg, hash!)
      expect(isValid).toBe(true)
    })
  })
})
