import { fromBuffer } from 'pdf2pic'
import archiver from 'archiver'
import { PassThrough } from 'stream'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

/**
 * Collects in-memory archive data from archiver into a Buffer.
 */
function createZipBuffer(
  addFiles: (archive: archiver.Archiver) => void
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const passthrough = new PassThrough()

    passthrough.on('data', (chunk: Buffer) => chunks.push(chunk))
    passthrough.on('end', () => resolve(Buffer.concat(chunks)))
    passthrough.on('error', reject)

    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.on('error', reject)
    archive.pipe(passthrough)

    addFiles(archive)

    archive.finalize()
  })
}

/**
 * Converts a PDF to images (one image per page) using pdf2pic.
 * All images are zipped and returned as a single ZIP file.
 *
 * Supported params:
 *  - dpi (number, default 150): Render density in DPI (higher = better quality, larger files)
 *  - format ('jpg'|'png', default 'jpg'): Output image format
 *  - quality (number 1–100, default 85): JPEG quality (ignored for PNG)
 *
 * Uses A4-equivalent pixel dimensions at the specified DPI.
 * Returns: ZIP archive containing one image per page (named page-0001.jpg etc.)
 */
export const pdfToImage: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const dpi = typeof params.dpi === 'number' && params.dpi > 0 ? params.dpi : 150
  const format = params.format === 'png' ? 'png' : 'jpg'
  const quality = typeof params.quality === 'number' ? params.quality : 85

  // Calculate page dimensions for the given DPI (A4 proportions)
  const width = Math.round((8.27 * dpi))   // A4 width in inches × dpi
  const height = Math.round((11.69 * dpi)) // A4 height in inches × dpi

  onProgress(10)

  const converter = fromBuffer(buffer, {
    density: dpi,
    format,
    quality,
    width,
    height,
  })

  // Convert all pages (-1 = all pages), request buffer response
  const results = await converter.bulk(-1, { responseType: 'buffer' })

  onProgress(80)

  const ext = format === 'png' ? 'png' : 'jpg'
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'

  // ZIP all page images
  const zipBuffer = await createZipBuffer((archive) => {
    results.forEach((result, index) => {
      const imageBuffer = result.buffer
      if (!imageBuffer) return
      const name = `page-${(index + 1).toString().padStart(4, '0')}.${ext}`
      archive.append(imageBuffer, { name })
    })
  })

  onProgress(100)

  return {
    buffer: zipBuffer,
    mimeType: 'application/zip',
    filename: `pdf-images.zip`,
  }
}
