/**
 * Service Worker Template Loader
 * ==============================
 *
 * Loads templates in Service Worker context where import.meta.glob doesn't work.
 * Uses shared processing logic from template-processing.ts for consistency.
 */

import yaml from 'js-yaml'
import type { SimpleTemplate, YamlTemplate } from '../types/template-types'
import { logger } from '../utils/logger'
import { processTemplateLayers } from '../utils/template-processing'

// Direct imports of all templates (required for Service Worker IIFE bundle)
import bookletCoverYaml from '../../templates/booklet-cover.yaml?raw'
import businessCardYaml from '../../templates/business-card.yaml?raw'
import catalogPageYaml from '../../templates/catalog-page.yaml?raw'
import concertTicketYaml from '../../templates/concert-ticket.yaml?raw'
import conferenceStickerYaml from '../../templates/conference-sticker.yaml?raw'
import eventPromoStickerYaml from '../../templates/event-promo-sticker.yaml?raw'
import qualityStickerYaml from '../../templates/quality-sticker.yaml?raw'
import safetyAlertDiamondYaml from '../../templates/safety-alert-diamond.yaml?raw'
import shippingLabelYaml from '../../templates/shipping-label.yaml?raw'
import socialMediaPostYaml from '../../templates/social-media-post.yaml?raw'
import techCompanyStickerYaml from '../../templates/tech-company-sticker.yaml?raw'
import vinylRecordLabelYaml from '../../templates/vinyl-record-label.yaml?raw'
import wellnessStickerYaml from '../../templates/wellness-sticker.yaml?raw'
import youtubeThumbnailYaml from '../../templates/youtube-thumbnail.yaml?raw'

const templateYamlMap: Record<string, string> = {
  'booklet-cover': bookletCoverYaml,
  'business-card': businessCardYaml,
  'catalog-page': catalogPageYaml,
  'concert-ticket': concertTicketYaml,
  'conference-sticker': conferenceStickerYaml,
  'event-promo-sticker': eventPromoStickerYaml,
  'quality-sticker': qualityStickerYaml,
  'safety-alert-diamond': safetyAlertDiamondYaml,
  'shipping-label': shippingLabelYaml,
  'social-media-post': socialMediaPostYaml,
  'tech-company-sticker': techCompanyStickerYaml,
  'vinyl-record-label': vinylRecordLabelYaml,
  'wellness-sticker': wellnessStickerYaml,
  'youtube-thumbnail': youtubeThumbnailYaml
}

/**
 * Parse template from YAML content
 * Uses shared processing logic for shape→path conversion and coordinate resolution
 * NOTE: Does not load SVG content (svgContent should be provided in URL state)
 */
async function parseTemplate(templateId: string, yamlContent: string): Promise<SimpleTemplate> {
  const yamlTemplate = yaml.load(yamlContent) as YamlTemplate

  // Calculate viewBox (matches main template-loader.ts logic)
  const viewBox = yamlTemplate.width && yamlTemplate.height
    ? {
        x: 0,
        y: 0,
        width: yamlTemplate.width,
        height: yamlTemplate.height
      }
    : yamlTemplate.viewBox || { x: 0, y: 0, width: 400, height: 400 }

  // Process layers using shared utility (WITHOUT SVG content loader)
  // SVG content should be pre-loaded and included in URL state
  const layers = await processTemplateLayers(yamlTemplate)

  return {
    id: yamlTemplate.id,
    name: yamlTemplate.name,
    description: yamlTemplate.description,
    category: yamlTemplate.category,
    width: yamlTemplate.width ?? viewBox.width,
    height: yamlTemplate.height ?? viewBox.height,
    viewBox,
    layers
  }
}

/**
 * Load template by ID in Service Worker context
 */
export async function loadTemplate(templateId: string): Promise<SimpleTemplate | null> {
  const yamlContent = templateYamlMap[templateId]
  if (!yamlContent) {
    return null
  }

  try {
    return await parseTemplate(templateId, yamlContent)
  } catch (error) {
    logger.error('Failed to load template:', templateId, error)
    return null
  }
}
