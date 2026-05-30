import sharp from 'sharp'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

/**
 * Compresses an image using sharp.
 *
 * Supported params:
 *  - quality (number 1–100, default 80): JPEG/WebP/AVIF quality
 *  - progressive (boolean, default true): Enable progressive JPEG encoding
 *  - stripExif (boolean, default true): Remove EXIF metadata
 *  - convertToWebP (boolean, default false): Convert PNG > 1MB to WebP for better compression
 */
export const compressImage: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const quality = typeof params.quality === 'number' ? params.quality : 80
  const progressive = params.progressive !== false
  const stripExif = params.stripExif !== false
  const convertToWebP = params.convertToWebP === true

  // Detect input format
  const metadata = await sharp(buffer).metadata()
  const format = metadata.format ?? 'jpeg'

  onProgress(50)

  let pipeline = sharp(buffer)

  // Strip EXIF metadata if requested
  if (stripExif) {
    pipeline = pipeline.rotate() // auto-rotate from EXIF then strip
  }

  let outputBuffer: Buffer
  let mimeType: string
  let ext: string

  if (format === 'png' && convertToWebP && buffer.length > 1_048_576) {
    // Convert large PNGs to WebP
    outputBuffer = await pipeline.webp({ quality }).toBuffer()
    mimeType = 'image/webp'
    ext = 'webp'
  } else if (format === 'png') {
    outputBuffer = await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer()
    mimeType = 'image/png'
    ext = 'png'
  } else if (format === 'webp') {
    outputBuffer = await pipeline.webp({ quality }).toBuffer()
    mimeType = 'image/webp'
    ext = 'webp'
  } else if (format === 'avif') {
    outputBuffer = await pipeline.avif({ quality }).toBuffer()
    mimeType = 'image/avif'
    ext = 'avif'
  } else {
    // Default: JPEG
    outputBuffer = await pipeline
      .jpeg({ quality, progressive })
      .toBuffer()
    mimeType = 'image/jpeg'
    ext = format === 'jpg' ? 'jpg' : 'jpg'
  }

  onProgress(100)

  return {
    buffer: outputBuffer,
    mimeType,
    filename: `compressed.${ext}`,
  }
}
