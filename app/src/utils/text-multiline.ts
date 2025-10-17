/**
 * Multi-line text utilities for SVG rendering
 *
 * Handles splitting text on newlines and calculating vertical offsets
 * to achieve proper centering of multi-line text blocks.
 */

/**
 * Split text on newline characters
 *
 * @param text - Text string potentially containing \n characters
 * @returns Array of text lines
 */
export function splitLines(text: string): string[] {
  return text.split('\n')
}

/**
 * Calculate dy offset for tspan element to achieve vertical centering
 *
 * For multi-line text rendered with tspan elements, we need to calculate
 * the vertical offset for each line to center the entire text block.
 *
 * The first line is offset upward (negative dy) to position the block center
 * at the text element's anchor point. Subsequent lines use positive dy to
 * space downward from the previous line.
 *
 * @param index - Line index (0-based)
 * @param totalLines - Total number of lines in the text block
 * @param fontSize - Font size in pixels
 * @param lineHeight - Line height multiplier (e.g., 1.2 = 120% of font size)
 * @returns dy offset in pixels
 *
 * @example
 * // For 3 lines with fontSize=24 and lineHeight=1.2:
 * calculateLineDy(0, 3, 24, 1.2) // -28.8 (offset first line up)
 * calculateLineDy(1, 3, 24, 1.2) // 28.8 (space down from line 1)
 * calculateLineDy(2, 3, 24, 1.2) // 28.8 (space down from line 2)
 */
export function calculateLineDy(
  index: number,
  totalLines: number,
  fontSize: number,
  lineHeight: number
): number {
  if (index === 0) {
    // First line: offset upward to center the entire block
    // Formula: -(totalLines - 1) * lineSpacing / 2
    const lineSpacing = fontSize * lineHeight
    return -(totalLines - 1) * lineSpacing / 2
  }
  // Subsequent lines: offset downward by line spacing
  return fontSize * lineHeight
}
