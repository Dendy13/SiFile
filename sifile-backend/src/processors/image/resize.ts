import sharp, { FitEnum } from 'sharp'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

/**
 * Resizes an image using sharp, preserving the original format.
 *
 * Supported params:
 *  - width (number): Target width in pixels
 *  - height (number): Target height in pixels
 *  - maintainAspectRatio (boolean, default true): Keep aspect ratio when resizing
 *  - fit ('contain'|'cover'|'fill', default 'contain'): Sharp resize fit mode
 */
export const resizeImage: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const width = typeof params.width === 'number' ? params.width : undefined
  const height = typeof params.height === 'number' ? params.height : undefined
  const maintainAspectRatio = params.maintainAspectRatio !== false

  const validFits = ['contain', 'cover', 'fill']
  const fitParam = typeof params.fit === 'string' && validFits.includes(params.fit)
    ? params.fit
    : 'contain'
  const fit = fitParam as keyof FitEnum

  // Detect input format to preserve it
  const metadata = await sharp(buffer).metadata()
  const format = metadata.format ?? 'jpeg'

  onProgress(30)

  let pipeline = sharp(buffer).resize({
    width,
    height,
    fit: maintainAspectRatio ? fit : sharp.fit.fill,
    withoutEnlargement: true,
  })

  onProgress(60)

  // Re-encode in the same format as input
  let outputBuffer: Buffer
  let mimeType: string
  let ext: string

  switch (format) {
    case 'png':
      outputBuffer = await pipeline.png().toBuffer()
      mimeType = 'image/png'
      ext = 'png'
      break
    case 'webp':
      outputBuffer = await pipeline.webp().toBuffer()
      mimeType = 'image/webp'
      ext = 'webp'
      break
    case 'avif':
      outputBuffer = await pipeline.avif().toBuffer()
      mimeType = 'image/avif'
      ext = 'avif'
      break
    case 'gif':
      outputBuffer = await pipeline.gif().toBuffer()
      mimeType = 'image/gif'
      ext = 'gif'
      break
    case 'tiff':
      outputBuffer = await pipeline.tiff().toBuffer()
      mimeType = 'image/tiff'
      ext = 'tiff'
      break
    default:
      outputBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer()
      mimeType = 'image/jpeg'
      ext = 'jpg'
  }

  onProgress(100)

  return {
    buffer: outputBuffer,
    mimeType,
    filename: `resized.${ext}`,
  }
}
