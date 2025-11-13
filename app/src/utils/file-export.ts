/**
 * File Export Utilities
 *
 * Provides functions for exporting SVG content to various formats (SVG, PNG, WebP, PDF).
 * These are pure utility functions that handle the download mechanics.
 */

import { jsPDF } from 'jspdf'
import { logger } from './logger'

/**
 * Download trigger helper - creates and clicks a download link
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert SVG string to canvas element
 */
// eslint-disable-next-line no-undef
function svgToCanvas(svgContent: string, width: number, height: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Export SVG content as .svg file
 */
export async function exportAsSvg(svgContent: string, filename: string): Promise<void> {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  triggerDownload(blob, `${filename}.svg`)
}

/**
 * Export SVG content as .png file
 */
export async function exportAsPng(
  svgContent: string,
  filename: string,
  width: number,
  height: number
): Promise<void> {
  if (!width || !height || width <= 0 || height <= 0) {
    logger.error('Cannot export PNG: invalid dimensions', { width, height })
    throw new Error('Invalid dimensions for PNG export')
  }

  try {
    const canvas = await svgToCanvas(svgContent, width, height)

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'))
          return
        }
        triggerDownload(blob, `${filename}.png`)
        resolve()
      }, 'image/png')
    })
  } catch (error) {
    logger.error('PNG export failed', error)
    throw error
  }
}

/**
 * Export SVG content as .webp file
 */
export async function exportAsWebP(
  svgContent: string,
  filename: string,
  width: number,
  height: number
): Promise<void> {
  if (!width || !height || width <= 0 || height <= 0) {
    logger.error('Cannot export WebP: invalid dimensions', { width, height })
    throw new Error('Invalid dimensions for WebP export')
  }

  try {
    const canvas = await svgToCanvas(svgContent, width, height)

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create WebP blob'))
          return
        }
        triggerDownload(blob, `${filename}.webp`)
        resolve()
      }, 'image/webp')
    })
  } catch (error) {
    logger.error('WebP export failed', error)
    throw error
  }
}

/**
 * Export SVG content as .pdf file
 */
export async function exportAsPdf(
  svgContent: string,
  filename: string,
  width: number,
  height: number
): Promise<void> {
  if (!width || !height || width <= 0 || height <= 0) {
    logger.error('Cannot export PDF: invalid dimensions', { width, height })
    throw new Error('Invalid dimensions for PDF export')
  }

  try {
    // Convert px to mm at 96 DPI
    const widthMm = (width * 25.4) / 96
    const heightMm = (height * 25.4) / 96

    const pdf = new jsPDF({
      unit: 'mm',
      format: [widthMm, heightMm]
    })

    // Convert SVG to canvas first
    const canvas = await svgToCanvas(svgContent, width, height)

    // Get image data from canvas
    const imgData = canvas.toDataURL('image/png')

    // Add image to PDF (positioned at origin, full size)
    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm)

    // Trigger download
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    logger.error('PDF export failed', error)
    throw error
  }
}

/**
 * Generate a filename based on template name and timestamp
 */
export function generateFilename(templateName?: string): string {
  const timestamp = Date.now()
  const sanitized = templateName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'sticker'
  return `${sanitized}-${timestamp}`
}
