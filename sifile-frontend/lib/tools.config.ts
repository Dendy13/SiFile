/**
 * Tool definitions for SiFile.
 * Each tool maps to a route /tools/[slug] and a backend operation.
 */

export type ToolCategory = 'pdf' | 'image'
export type ToolPriority = 'P0' | 'P1' | 'P2'

export interface Tool {
  slug: string
  name: string
  description: string
  category: ToolCategory
  operation: string       // Backend operation key
  priority: ToolPriority
  acceptedTypes: string[] // MIME types
  icon: string            // Emoji or icon name
  comingSoon?: boolean
}

export const TOOLS: Tool[] = [
  // ─── PDF P0 ──────────────────────────────────
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining visual quality.',
    category: 'pdf',
    operation: 'pdf-compress',
    priority: 'P0',
    acceptedTypes: ['application/pdf'],
    icon: '📉',
  },
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document.',
    category: 'pdf',
    operation: 'pdf-merge',
    priority: 'P0',
    acceptedTypes: ['application/pdf'],
    icon: '🔗',
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF into separate pages or page ranges.',
    category: 'pdf',
    operation: 'pdf-split',
    priority: 'P0',
    acceptedTypes: ['application/pdf'],
    icon: '✂️',
  },
  {
    slug: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert each PDF page to a high-quality JPG or PNG.',
    category: 'pdf',
    operation: 'pdf-to-image',
    priority: 'P0',
    acceptedTypes: ['application/pdf'],
    icon: '🖼️',
  },
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Create a PDF from one or multiple images.',
    category: 'pdf',
    operation: 'image-to-pdf',
    priority: 'P0',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    icon: '📄',
  },

  // ─── PDF P1 ──────────────────────────────────
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages 90, 180, or 270 degrees.',
    category: 'pdf',
    operation: 'pdf-rotate',
    priority: 'P1',
    acceptedTypes: ['application/pdf'],
    icon: '🔄',
    comingSoon: true,
  },
  {
    slug: 'watermark-pdf',
    name: 'Add Watermark',
    description: 'Add a text or image watermark to your PDF.',
    category: 'pdf',
    operation: 'pdf-watermark',
    priority: 'P1',
    acceptedTypes: ['application/pdf'],
    icon: '💧',
    comingSoon: true,
  },
  {
    slug: 'extract-pages',
    name: 'Extract Pages',
    description: 'Extract specific pages from a PDF into a new file.',
    category: 'pdf',
    operation: 'pdf-extract-pages',
    priority: 'P1',
    acceptedTypes: ['application/pdf'],
    icon: '📋',
    comingSoon: true,
  },
  {
    slug: 'summarize-document',
    name: 'Summarize Document',
    description: 'Generate an intelligent summary of any PDF or image using AI.',
    category: 'pdf',
    operation: 'doc-summarize',
    priority: 'P1',
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    icon: '📝',
  },
  {
    slug: 'compare-documents',
    name: 'Compare Documents',
    description: 'Compare two documents (PDFs or images) and generate a detailed AI difference report.',
    category: 'pdf',
    operation: 'doc-compare',
    priority: 'P1',
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    icon: '📊',
  },

  // ─── Image P0 ─────────────────────────────────
  {
    slug: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce image file size with optimal quality settings.',
    category: 'image',
    operation: 'image-compress',
    priority: 'P0',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    icon: '🗜️',
  },
  {
    slug: 'resize-image',
    name: 'Resize Image',
    description: 'Resize images with smart presets or custom dimensions.',
    category: 'image',
    operation: 'image-resize',
    priority: 'P0',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
    icon: '📐',
  },
  {
    slug: 'convert-image',
    name: 'Convert Image',
    description: 'Convert between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF formats.',
    category: 'image',
    operation: 'image-convert',
    priority: 'P0',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif'],
    icon: '🔀',
  },

  // ─── Image P1 ─────────────────────────────────
  {
    slug: 'crop-image',
    name: 'Crop Image',
    description: 'Crop images with preset ratios or custom selection.',
    category: 'image',
    operation: 'image-crop',
    priority: 'P1',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    icon: '🖼️',
    comingSoon: true,
  },
  {
    slug: 'remove-background',
    name: 'Remove Background',
    description: 'Automatically remove image background with AI.',
    category: 'image',
    operation: 'image-remove-bg',
    priority: 'P1',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    icon: '🪄',
    comingSoon: true,
  },
  {
    slug: 'watermark-image',
    name: 'Watermark Image',
    description: 'Add text or logo watermark to your images.',
    category: 'image',
    operation: 'image-watermark',
    priority: 'P1',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    icon: '💧',
    comingSoon: true,
  },
  {
    slug: 'rotate-image',
    name: 'Rotate & Flip',
    description: 'Rotate and flip images with EXIF auto-correction.',
    category: 'image',
    operation: 'image-rotate',
    priority: 'P1',
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    icon: '↩️',
    comingSoon: true,
  },
]

export const PDF_TOOLS = TOOLS.filter((t) => t.category === 'pdf')
export const IMAGE_TOOLS = TOOLS.filter((t) => t.category === 'image')
export const AVAILABLE_TOOLS = TOOLS.filter((t) => !t.comingSoon)
export const COMING_SOON_TOOLS = TOOLS.filter((t) => t.comingSoon)

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug)
}
