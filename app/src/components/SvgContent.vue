<template>
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

  <!-- PHASE 2: LAYER RENDERING (preserves YAML order) -->
  <template v-for="{ templateLayer, layerData, transformCase } in renderedLayers" :key="templateLayer.id">
    <!-- SHAPE LAYERS -->
    <!-- Shape paths are already positioned and centered during template loading -->
    <!-- No additional transforms needed - path coordinates are final -->
    <g
      v-if="templateLayer.type === 'shape'"
      :data-layer-id="templateLayer.id"
      :data-layer-type="templateLayer.type"
      class="layer-clickable"
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
      :data-layer-id="templateLayer.id"
      :data-layer-type="templateLayer.type"
      class="layer-clickable"
      :mask="templateLayer.clip ? `url(#${templateLayer.clip})` : undefined"
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
    <!-- Uses shared transform case logic from svg-transforms.ts to ensure visual parity -->
    <g
      v-else-if="templateLayer.type === 'svgImage'"
      :data-layer-id="templateLayer.id"
      :data-layer-type="templateLayer.type"
      class="layer-clickable"
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
        <!-- Scale and rotate around transform origin -->
        <template v-if="transformCase?.case === 'scale-with-origin'">
          <g
            :transform="`translate(${
              calculateScaledTransformOrigin(
                layerData?.svgContent || templateLayer.svgContent,
                templateLayer.width,
                templateLayer.height,
                transformCase.transformOrigin
              ).x
            }, ${
              calculateScaledTransformOrigin(
                layerData?.svgContent || templateLayer.svgContent,
                templateLayer.width,
                templateLayer.height,
                transformCase.transformOrigin
              ).y
            })`"
          >
            <g :transform="`scale(${transformCase.scale})${transformCase.rotation !== undefined ? ` rotate(${transformCase.rotation})` : ''}`">
              <g
                :transform="`translate(${
                  -calculateScaledTransformOrigin(
                    layerData?.svgContent || templateLayer.svgContent,
                    templateLayer.width,
                    templateLayer.height,
                    transformCase.transformOrigin
                  ).x
                }, ${
                  -calculateScaledTransformOrigin(
                    layerData?.svgContent || templateLayer.svgContent,
                    templateLayer.width,
                    templateLayer.height,
                    transformCase.transformOrigin
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
        </template>

        <!-- Scale only (without transform origin) -->
        <template v-else-if="transformCase?.case === 'scale-only'">
          <g :transform="`scale(${transformCase.scale})`">
            <g
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
        </template>

        <!-- Rotation only (no scale) -->
        <template v-else-if="transformCase?.case === 'rotation-only'">
          <g :transform="`rotate(${transformCase.rotation})`">
            <g
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
        </template>

        <!-- No transforms -->
        <template v-else>
          <g
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
        </template>
      </g>
    </g>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SimpleTemplate, FlatLayerData } from '../types/template-types'
import { resolveLayerPosition } from '../utils/layer-positioning'
import { generateMaskDefinitions } from '../utils/mask-utils'
import { getSvgImageTransformCase, calculateScaledTransformOrigin, applySvgRenderingAttributes } from '../utils/svg-transforms'
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
 * Computes transform case once per svgImage layer for efficiency
 */
const renderedLayers = computed(() => {
  if (!props.template?.layers) return []

  return props.template.layers.map(templateLayer => {
    const layerData = props.layers.find(l => l.id === templateLayer.id)

    // For svgImage layers, compute transform case once
    const transformCase = templateLayer.type === 'svgImage'
      ? getSvgImageTransformCase(layerData)
      : undefined

    return {
      templateLayer,
      layerData,
      transformCase
    }
  })
})
</script>
