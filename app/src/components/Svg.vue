<template>
  <svg
    :viewBox="`0 0 ${template.width} ${template.height}`"
    xmlns="http://www.w3.org/2000/svg"
    class="svg-content"
  >
    <!-- PHASE 1: MASK DEFINITIONS -->
    <defs v-if="maskDefinitions.length > 0">
      <!-- Simple mask definitions from shape layers -->
      <mask
        v-for="mask in maskDefinitions"
        :id="mask.id"
        :key="mask.id"
      >
        <path :d="mask.path" fill="white" />
      </mask>
    </defs>

    <!-- DEBUG: Mask boundaries (absolute coordinates like shapes) -->
    <g v-if="mode === 'debug'">
      <!-- Show mask region with semi-transparent fill -->
      <path
        v-for="mask in maskDefinitions"
        :key="`debug-fill-${mask.id}`"
        :d="mask.path"
        fill="red"
        stroke="none"
        opacity="0.15"
      />
      <!-- Show mask boundary with thick dashed stroke -->
      <path
        v-for="mask in maskDefinitions"
        :key="`debug-stroke-${mask.id}`"
        :d="mask.path"
        fill="none"
        stroke="red"
        stroke-width="4"
        stroke-dasharray="8,4"
        opacity="0.8"
      />
    </g>

    <!-- PHASE 2: LAYER RENDERING (preserves YAML order) -->
    <template v-for="{ templateLayer, layerData } in renderedLayers" :key="templateLayer.id">
      <!-- SHAPE LAYERS -->
      <!-- Shape paths are already positioned and centered during template loading -->
      <!-- No additional transforms needed - path coordinates are final -->
      <g v-if="templateLayer.type === 'shape'">
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
        :mask="templateLayer.clip ? `url(#${templateLayer.clip})` : undefined"
      >
        <g
          :transform="`translate(${
            resolveLayerPosition(templateLayer.position.x, template.width)
          }, ${
            resolveLayerPosition(templateLayer.position.y, template.height)
          })${templateLayer.rotation !== undefined ? ` rotate(${templateLayer.rotation})` : ''}`"
        >
          <!-- DEBUG: Layer center point (blue) -->
          <circle
            v-if="mode === 'debug'"
            cx="0"
            cy="0"
            r="5"
            fill="blue"
            opacity="0.7"
          />
          <text
            text-anchor="middle"
            dominant-baseline="central"
            :font-family="extractFontFamily(layerData) ?? templateLayer.fontFamily"
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
        :mask="templateLayer.clip ? `url(#${templateLayer.clip})` : undefined"
      >
        <g
          :transform="`translate(${
            resolveLayerPosition(templateLayer.position.x, template.width)
          }, ${
            resolveLayerPosition(templateLayer.position.y, template.height)
          }) translate(${
            -templateLayer.width / 2
          }, ${
            -templateLayer.height / 2
          })`"
        >
          <!-- DEBUG: Layer boundary (green rectangle) -->
          <rect
            v-if="mode === 'debug'"
            x="0"
            y="0"
            :width="templateLayer.width"
            :height="templateLayer.height"
            fill="none"
            stroke="green"
            stroke-width="2"
            stroke-dasharray="3,3"
            opacity="0.7"
          />
          <!-- Scale and rotate around transform origin using nested g elements -->
          <g
            v-if="layerData?.transformOrigin && layerData?.scale !== undefined"
            :transform="`translate(${
            calculateScaledTransformOrigin(
              layerData?.svgContent || templateLayer.svgContent,
              templateLayer.width,
              templateLayer.height,
              layerData.transformOrigin
            ).x
          }, ${
            calculateScaledTransformOrigin(
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
                -calculateScaledTransformOrigin(
                  layerData?.svgContent || templateLayer.svgContent,
                  templateLayer.width,
                  templateLayer.height,
                  layerData.transformOrigin
                ).x
              }, ${
                -calculateScaledTransformOrigin(
                  layerData?.svgContent || templateLayer.svgContent,
                  templateLayer.width,
                  templateLayer.height,
                  layerData.transformOrigin
                ).y
              })`"
              v-html="applySvgRenderingAttributes(
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
          v-html="applySvgRenderingAttributes(
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
          v-html="applySvgRenderingAttributes(
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
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'
import { resolveLayerPosition } from '../utils/layer-positioning'
import { generateMaskDefinitions } from '../utils/clip-path-helpers'
import { calculateScaledTransformOrigin, applySvgRenderingAttributes } from '../utils/svg-transforms'
import { extractFontFamily } from '../utils/font-utils'

interface Props {
  template: SimpleTemplate
  layers: FlatLayerData[]
  mode?: 'viewport' | 'preview' | 'download'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'viewport'
})

/**
 * Extract mask definitions from shape layers
 * These need to be in <defs> before usage
 */
const maskDefinitions = computed(() => {
  return generateMaskDefinitions(
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