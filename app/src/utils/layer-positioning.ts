/**
 * Layer Positioning Utilities
 *
 * SINGLE function for percentage resolution - center-based positioning
 * NO other positioning functions allowed
 */

/**
 * Resolve layer position from percentage or absolute value to absolute coordinates
 * Returns the CENTER point of the element (center-based positioning)
 *
 * @param value - Position value (percentage string like "50%" or absolute number)
 * @param dimension - Template dimension (width or height)
 * @returns Absolute coordinate representing the center of the element
 */
export function resolveLayerPosition(
  value: number | string | undefined,
  dimension: number
): number {
  if (value === undefined) return dimension / 2

  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * dimension
  }

  return value as number
}