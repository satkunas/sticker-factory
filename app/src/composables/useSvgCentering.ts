/**
 * SVG Centering Composable
 *
 * Vue composable for reactive SVG centering state management.
 * Uses pure utils for calculations while providing Vue reactivity.
 */

import { computed, ref, watch, type Ref, type ComputedRef } from 'vue'
import type { SimpleTemplate } from '../types/template-types'
import {
  calculateCenteringTransform,
  calculateContentBounds,
  calculateGridBounds,
  maintainCenterDuringZoom,
  maintainCenterDuringRotation,
  combineTransforms,
  type Point,
  type Dimensions,
  type CenteringTransform,
  type GridBounds
} from '../utils/svg-centering'

// Composable return type
export interface SvgCenteringState {
  // Content dimensions
  contentDimensions: ComputedRef<Dimensions>
  contentWidth: ComputedRef<number>
  contentHeight: ComputedRef<number>

  // Grid bounds
  gridBounds: ComputedRef<GridBounds>

  // Centering transforms
  centeringTransform: ComputedRef<string>
  centeringTransformValues: ComputedRef<CenteringTransform>

  // Image center tracking
  imageCenters: Ref<Map<string, Point>>

  // Methods
  updateImageCenter: (imageId: string, center: Point) => void
  getImageCenterTransform: (imageId: string, zoomLevel?: number, rotation?: number) => string
  getCombinedTransform: (baseTransform: string, additionalTransforms: string[]) => string
}

/**
 * SVG Centering Composable
 *
 * @param template - Reactive reference to current template
 * @param customContentDimensions - Optional custom content dimensions (overrides auto-calculation)
 * @param gridScale - Scale factor for background grid (default: 2.0)
 * @returns Reactive centering state and methods
 */
export function useSvgCentering(
  template: Ref<SimpleTemplate | null>,
  customContentDimensions?: Ref<Dimensions | null>,
  gridScale = 2.0
): SvgCenteringState {
  const imageCenters = ref<Map<string, Point>>(new Map())

  const contentDimensions = computed<Dimensions>(() => {
    if (customContentDimensions?.value) {
      return customContentDimensions.value
    }

    if (template.value?.viewBox) {
      return calculateContentBounds(template.value.viewBox, 1.5)
    }

    return { width: 400, height: 300 }
  })

  const contentWidth = computed(() => contentDimensions.value.width)
  const contentHeight = computed(() => contentDimensions.value.height)

  const gridBounds = computed<GridBounds>(() => {
    return calculateGridBounds(contentDimensions.value, gridScale)
  })

  const centeringTransformValues = computed<CenteringTransform>(() => {
    if (!template.value?.viewBox) {
      return {
        translateX: 0,
        translateY: 0,
        transformOrigin: 'center',
        transformString: ''
      }
    }

    return calculateCenteringTransform(
      template.value.viewBox,
      contentDimensions.value
    )
  })

  const centeringTransform = computed<string>(() => {
    return centeringTransformValues.value.transformString
  })

  const updateImageCenter = (imageId: string, center: Point) => {
    imageCenters.value.set(imageId, { ...center })
  }

  // Get transform for specific image with zoom/rotation
  const getImageCenterTransform = (
    imageId: string,
    zoomLevel?: number,
    rotation?: number
  ): string => {
    const imageCenter = imageCenters.value.get(imageId)
    if (!imageCenter) return ''

    const transforms: string[] = []

    if (zoomLevel && zoomLevel !== 1.0) {
      const contentCenter: Point = {
        x: contentDimensions.value.width / 2,
        y: contentDimensions.value.height / 2
      }

      const zoomTransform = maintainCenterDuringZoom(
        imageCenter,
        zoomLevel,
        contentCenter
      )

      if (zoomTransform.transformString) {
        transforms.push(zoomTransform.transformString)
      }
    }

    if (rotation && rotation !== 0) {
      const rotationTransform = maintainCenterDuringRotation(
        imageCenter,
        rotation,
        imageCenter // Rotate around image center
      )

      if (rotationTransform.transformString) {
        transforms.push(rotationTransform.transformString)
      }
    }

    return combineTransforms(transforms)
  }

  const getCombinedTransform = (
    baseTransform: string,
    additionalTransforms: string[]
  ): string => {
    const allTransforms = [baseTransform, ...additionalTransforms]
    return combineTransforms(allTransforms)
  }

  // Watch for template changes and clear image centers
  watch(
    () => template.value?.id,
    (newTemplateId, oldTemplateId) => {
      if (newTemplateId !== oldTemplateId) {
        imageCenters.value.clear()
      }
    }
  )

  return {
    contentDimensions,
    contentWidth,
    contentHeight,
    gridBounds,
    centeringTransform,
    centeringTransformValues,

    imageCenters,

    updateImageCenter,
    getImageCenterTransform,
    getCombinedTransform
  }
}

/**
 * Helper function to calculate image center from SVG element bounds
 *
 * @param element - SVG element (from template layer)
 * @param templateViewBox - Template's viewBox for coordinate system
 * @returns Center point of the element
 */
export function calculateElementCenter(
  element: { position?: { x: number | string, y: number | string }, width?: number, height?: number },
  templateViewBox: { width: number, height: number }
): Point | null {
  if (!element.position) return null

  // Handle percentage positions
  const resolvePosition = (pos: number | string, dimension: number): number => {
    if (typeof pos === 'string' && pos.endsWith('%')) {
      const percentValue = parseFloat(pos)
      if (isNaN(percentValue)) {
        throw new Error(`Invalid position value: "${pos}" - must be a number or percentage`)
      }
      return dimension * (percentValue / 100)
    }
    if (typeof pos === 'number') {
      return pos
    }
    // Parse string to number - if invalid, throw error (no hardcoded fallbacks)
    const parsed = parseFloat(pos)
    if (isNaN(parsed)) {
      throw new Error(`Invalid position value: "${pos}" - must be a number or percentage`)
    }
    return parsed
  }

  const x = resolvePosition(element.position.x, templateViewBox.width)
  const y = resolvePosition(element.position.y, templateViewBox.height)

  if (element.width && element.height) {
    return {
      x: x + element.width / 2,
      y: y + element.height / 2
    }
  }

  // For point elements (like text), position is the center
  return { x, y }
}