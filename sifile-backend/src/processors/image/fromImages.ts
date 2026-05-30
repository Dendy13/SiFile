import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

type PageSize = 'A4' | 'Letter'
type Orientation = 'portrait' | 'landscape'

// Page dimensions in PDF points (1pt = 1/72 inch)
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
}

/**
 * Converts a single image to a PDF document using pdf-lib and sharp.
 * The image is scaled to fit the page while maintaining aspect ratio.
 *
 * Supported params:
 *  - pageSize ('A4'|'Letter', default 'A4'): PDF page size
 *  - orientation ('portrait'|'landscape', default 'portrait'): Page orientation
 *
 * Supports JPEG and PNG input images (JPEG preferred by pdf-lib for embedding).
 * Other formats are converted to PNG via sharp before embedding.
 */
export const imageToPdf: ProcessorFn = async (input, params, onProgress) => {
  const buffers = Array.isArray(input) ? input : [input];
  onProgress(0)

  const pageSizeParam = (params.pageSize as string) === 'Letter' ? 'Letter' : 'A4'
  const orientation: Orientation =
    (params.orientation as string) === 'landscape' ? 'landscape' : 'portrait'

  const baseSize = PAGE_SIZES[pageSizeParam as PageSize]
  const pageWidth =
    orientation === 'landscape' ? baseSize.height : baseSize.width
  const pageHeight =
    orientation === 'landscape' ? baseSize.width : baseSize.height

  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < buffers.length; i++) {
    const buf = buffers[i]
    // Detect image format
    const metadata = await sharp(buf).metadata()
    const format = metadata.format
    const imgWidth = metadata.width ?? 1
    const imgHeight = metadata.height ?? 1

    // Ensure we have a buffer in a format pdf-lib can embed (JPEG or PNG)
    let embedBuffer: Buffer
    let isJpeg: boolean

    if (format === 'jpeg' || format === 'jpg') {
      embedBuffer = buf
      isJpeg = true
    } else if (format === 'png') {
      embedBuffer = buf
      isJpeg = false
    } else {
      embedBuffer = await sharp(buf).png().toBuffer()
      isJpeg = false
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    const embeddedImage = isJpeg
      ? await pdfDoc.embedJpg(embedBuffer)
      : await pdfDoc.embedPng(embedBuffer)

    // Fit image into page with margins (10pt margin on each side)
    const margin = 20
    const availWidth = pageWidth - margin * 2
    const availHeight = pageHeight - margin * 2

    const aspectRatio = imgWidth / imgHeight
    const availAspect = availWidth / availHeight

    let drawWidth: number
    let drawHeight: number

    if (aspectRatio > availAspect) {
      drawWidth = availWidth
      drawHeight = availWidth / aspectRatio
    } else {
      drawHeight = availHeight
      drawWidth = availHeight * aspectRatio
    }

    // Center image on page
    const x = margin + (availWidth - drawWidth) / 2
    const y = margin + (availHeight - drawHeight) / 2

    page.drawImage(embeddedImage, { x, y, width: drawWidth, height: drawHeight })
    
    onProgress(10 + Math.floor((i + 1) / buffers.length * 70))
  }

  onProgress(80)

  const pdfBytes = await pdfDoc.save()
  const outputBuffer = Buffer.from(pdfBytes)

  onProgress(100)

  return {
    buffer: outputBuffer,
    mimeType: 'application/pdf',
    filename: 'image-to-pdf.pdf',
  }
}
