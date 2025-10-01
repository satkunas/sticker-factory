<template>
  <svg
    :viewBox="`0 0 ${template.width} ${template.height}`"
    xmlns="http://www.w3.org/2000/svg"
    class="svg-content"
  >
    <!-- PHASE 1: CLIP PATH DEFINITIONS -->
    <defs v-if="clipPathDefinitions.length > 0">
      <clipPath
        v-for="clip in clipPathDefinitions"
        :id="clip.id"
        :key="clip.id"
      >
        <path :d="clip.path" :transform="clip.transform" />
      </clipPath>
    </defs>

    <!-- PHASE 2: LAYER RENDERING (preserves YAML order) -->
    <template v-for="{ templateLayer, layerData } in renderedLayers" :key="templateLayer.id">
      <!-- SHAPE LAYERS -->
      <g
        v-if="templateLayer.type === 'shape'"
        :transform="`translate(${
          resolveLayerPosition(templateLayer.position?.x, template.width)
        }, ${
          resolveLayerPosition(templateLayer.position?.y, template.height)
        }) translate(${
          -templateLayer.width / 2
        }, ${
          -templateLayer.height / 2
        })`"
      >
        <path
          :d="templateLayer.path"
          :fill="layerData?.fillColor ?? layerData?.fill ?? templateLayer.fill"
          :stroke="layerData?.strokeColor ?? layerData?.stroke ?? templateLayer.stroke"
          :stroke-width="layerData?.strokeWidth ?? templateLayer.strokeWidth"
          :stroke-linejoin="layerData?.strokeLinejoin"
        />
      </g>

      <!-- TEXT LAYERS -->
      <g
        v-else-if="templateLayer.type === 'text'"
        :clip-path="templateLayer.clip ? `url(#${templateLayer.clip})` : undefined"
      >
        <g
          :transform="`translate(${
            resolveLayerPosition(templateLayer.position.x, template.width)
          }, ${
            resolveLayerPosition(templateLayer.position.y, template.height)
          })${templateLayer.rotation !== undefined ? ` rotate(${templateLayer.rotation})` : ''}`"
        >
          <text
            text-anchor="middle"
            dominant-baseline="central"
            :font-family="layerData?.fontFamily ?? templateLayer.fontFamily"
            :font-size="layerData?.fontSize ?? templateLayer.fontSize"
            :font-weight="layerData?.fontWeight ?? templateLayer.fontWeight"
            :fill="layerData?.fontColor ?? layerData?.textColor ?? templateLayer.fontColor"
            :stroke="layerData?.strokeWidth !== undefined && layerData.strokeWidth > 0 ? (layerData?.strokeColor ?? templateLayer.strokeColor) : undefined"
            :stroke-width="layerData?.strokeWidth !== undefined && layerData.strokeWidth > 0 ? layerData.strokeWidth : undefined"
            :stroke-opacity="layerData?.strokeOpacity"
            :stroke-linejoin="layerData?.strokeLinejoin"
          >
            {{ layerData?.text ?? templateLayer.text }}
          </text>
        </g>
      </g>

      <!-- SVG IMAGE LAYERS -->
      <g
        v-else-if="templateLayer.type === 'svgImage'"
        :transform="`translate(${
          resolveLayerPosition(templateLayer.position.x, template.width)
        }, ${
          resolveLayerPosition(templateLayer.position.y, template.height)
        }) translate(${
          -templateLayer.width / 2
        }, ${
          -templateLayer.height / 2
        })`"
        :clip-path="templateLayer.clip ? `url(#${templateLayer.clip})` : undefined"
      >
        <!-- Scale and rotate around transform origin using nested g elements -->
        <g
          v-if="layerData?.transformOrigin && layerData?.scale !== undefined"
          :transform="`translate(${
            getScaledCentroid(
              layerData?.svgContent || templateLayer.svgContent,
              templateLayer.width,
              templateLayer.height,
              layerData.transformOrigin
            ).x
          }, ${
            getScaledCentroid(
              layerData?.svgContent || templateLayer.svgContent,
              templateLayer.width,
              templateLayer.height,
              layerData.transformOrigin
            ).y
          })`"
        >
          <!-- Apply scale and rotation at origin -->
          <g :transform="`scale(${layerData.scale})${layerData?.rotation !== undefined ? ` rotate(${layerData.rotation})` : ''}`">
            <!-- Translate back from centroid -->
            <g
              :transform="`translate(${
                -getScaledCentroid(
                  layerData?.svgContent || templateLayer.svgContent,
                  templateLayer.width,
                  templateLayer.height,
                  layerData.transformOrigin
                ).x
              }, ${
                -getScaledCentroid(
                  layerData?.svgContent || templateLayer.svgContent,
                  templateLayer.width,
                  templateLayer.height,
                  layerData.transformOrigin
                ).y
              })`"
              v-html="processSvgContent(
                layerData?.svgContent || templateLayer.svgContent,
                templateLayer.width,
                templateLayer.height,
                undefined,
                layerData?.color,
                layerData?.strokeColor,
                layerData?.strokeWidth
              )"
            />
          </g>
        </g>
        <!-- Rotation only (no scale) -->
        <g
          v-else-if="layerData?.rotation !== undefined"
          :transform="`rotate(${layerData.rotation})`"
          v-html="processSvgContent(
            layerData?.svgContent || templateLayer.svgContent,
            templateLayer.width,
            templateLayer.height,
            undefined,
            layerData?.color,
            layerData?.strokeColor,
            layerData?.strokeWidth
          )"
        />
        <!-- Fallback for no transform origin -->
        <g
          v-else
          v-html="processSvgContent(
            layerData?.svgContent || templateLayer.svgContent,
            templateLayer.width,
            templateLayer.height,
            undefined,
            layerData?.color,
            layerData?.strokeColor,
            layerData?.strokeWidth
          )"
        />
      </g>
    </template>

    <!-- DEBUG: Crosshair at template center (50%, 50%) -->
    <g class="debug-crosshair">
      <!-- Vertical line at 50% width -->
      <line
        :x1="template.width / 2"
        y1="0"
        :x2="template.width / 2"
        :y2="template.height"
        stroke="red"
        stroke-width="1"
        stroke-dasharray="5,5"
        opacity="0.5"
      />
      <!-- Horizontal line at 50% height -->
      <line
        x1="0"
        :y1="template.height / 2"
        :x2="template.width"
        :y2="template.height / 2"
        stroke="red"
        stroke-width="1"
        stroke-dasharray="5,5"
        opacity="0.5"
      />
      <!-- Center circle -->
      <circle
        :cx="template.width / 2"
        :cy="template.height / 2"
        r="3"
        fill="red"
        opacity="0.7"
      />
      <!-- Center label -->
      <text
        :x="template.width / 2 + 5"
        :y="template.height / 2 - 5"
        fill="red"
        font-size="8"
        opacity="0.7"
      >
        50%,50%
      </text>
    </g>

    <!-- DEBUG: Position markers for each layer -->
    <g class="debug-markers">
      <template v-for="{ templateLayer } in renderedLayers" :key="`marker-${templateLayer.id}`">
        <circle
          :cx="resolveLayerPosition(templateLayer.position?.x, template.width)"
          :cy="resolveLayerPosition(templateLayer.position?.y, template.height)"
          r="2"
          :fill="templateLayer.type === 'text' ? 'blue' : templateLayer.type === 'shape' ? 'green' : 'orange'"
          opacity="0.8"
        />
        <text
          :x="resolveLayerPosition(templateLayer.position?.x, template.width) + 5"
          :y="resolveLayerPosition(templateLayer.position?.y, template.height) - 5"
          :fill="templateLayer.type === 'text' ? 'blue' : templateLayer.type === 'shape' ? 'green' : 'orange'"
          font-size="7"
          opacity="0.8"
        >
          {{ templateLayer.id }}
        </text>
      </template>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'
import { resolveLayerPosition } from '../utils/layer-positioning'
import { generateClipPathDefinitions } from '../utils/clip-path-helpers'

interface Props {
  template: SimpleTemplate
  layers: FlatLayerData[]
  mode?: 'viewport' | 'preview' | 'download'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'viewport'
})

/**
 * Calculate scaled centroid coordinates for SVG images
 * Converts transform origin from viewBox space to template space
 */
function getScaledCentroid(
  svgContent: string,
  templateWidth: number,
  templateHeight: number,
  transformOrigin: { x: number; y: number }
): { x: number; y: number } {
  // Extract viewBox from SVG content
  const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']*)["']/i)

  let scaledOriginX = transformOrigin.x
  let scaledOriginY = transformOrigin.y

  if (viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].split(/\s+/).map(Number)
    if (viewBoxValues.length === 4) {
      const [, , viewBoxWidth, viewBoxHeight] = viewBoxValues

      // Calculate scale ratio from viewBox to template dimensions
      const scaleX = templateWidth / viewBoxWidth
      const scaleY = templateHeight / viewBoxHeight

      // Scale transform origin coordinates to template space
      scaledOriginX = transformOrigin.x * scaleX
      scaledOriginY = transformOrigin.y * scaleY
    }
  }

  return { x: scaledOriginX, y: scaledOriginY }
}

/**
 * Process SVG content to ensure it respects parent transforms
 * Adds width/height, overflow="visible", and styling attributes
 */
function processSvgContent(
  svgContent: string,
  templateWidth?: number,
  templateHeight?: number,
  clipPath?: string,
  color?: string,
  strokeColor?: string,
  strokeWidth?: number
): string {
  if (!svgContent) return ''

  // Build style attributes to add/replace
  const attributesToSet: Record<string, string> = {
    overflow: 'visible'
  }

  // Add width and height to force scaling to template dimensions
  if (templateWidth !== undefined) {
    attributesToSet.width = templateWidth.toString()
  }
  if (templateHeight !== undefined) {
    attributesToSet.height = templateHeight.toString()
  }

  if (clipPath) {
    attributesToSet['clip-path'] = clipPath
  }
  if (color !== undefined) {
    attributesToSet.fill = color
  }
  if (strokeColor !== undefined) {
    attributesToSet.stroke = strokeColor
  }
  if (strokeWidth !== undefined && strokeWidth > 0) {
    attributesToSet['stroke-width'] = strokeWidth.toString()
  }

  // Process the SVG element
  const processed = svgContent.replace(
    /<svg([^>]*)>/i,
    (match, attrs) => {
      let updatedAttrs = attrs

      // Remove existing width and height attributes
      updatedAttrs = updatedAttrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
      updatedAttrs = updatedAttrs.replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')

      // Add/replace our attributes
      Object.entries(attributesToSet).forEach(([key, value]) => {
        // Remove existing attribute if present
        const attrRegex = new RegExp(`\\s+${key}\\s*=\\s*["'][^"']*["']`, 'gi')
        updatedAttrs = updatedAttrs.replace(attrRegex, '')
        // Add new attribute
        updatedAttrs += ` ${key}="${value}"`
      })

      return `<svg${updatedAttrs}>`
    }
  )

  return processed
}

/**
 * Extract clip path definitions from shape layers
 * These need to be in <defs> before usage
 */
const clipPathDefinitions = computed(() => {
  return generateClipPathDefinitions(
    props.template.layers,
    props.template.width,
    props.template.height
  )
})

/**
 * Render layers with proper center-based positioning
 * Preserves YAML order (first = back, last = front)
 */
const renderedLayers = computed(() => {
  if (!props.template?.layers) return []

  return props.template.layers.map(templateLayer => {
    const layerData = props.layers.find(l => l.id === templateLayer.id)

    return {
      templateLayer,
      layerData
    }
  })
})
</script>

<style scoped>
.svg-content {
  width: 100%;
  height: 100%;
}
</style>