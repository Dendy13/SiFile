import sharp from 'sharp'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

type SupportedFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp' | 'tiff'

interface FormatConfig {
  mimeType: string
  ext: string
}

const FORMAT_MAP: Record<SupportedFormat, FormatConfig> = {
  jpg: { mimeType: 'image/jpeg', ext: 'jpg' },
  jpeg: { mimeType: 'image/jpeg', ext: 'jpg' },
  png: { mimeType: 'image/png', ext: 'png' },
  webp: { mimeType: 'image/webp', ext: 'webp' },
  avif: { mimeType: 'image/avif', ext: 'avif' },
  gif: { mimeType: 'image/gif', ext: 'gif' },
  bmp: { mimeType: 'image/bmp', ext: 'bmp' },
  tiff: { mimeType: 'image/tiff', ext: 'tiff' },
}

/**
 * Converts an image to the specified target format using sharp.
 *
 * Supported params:
 *  - targetFormat (required): One of 'jpg'|'jpeg'|'png'|'webp'|'avif'|'gif'|'bmp'|'tiff'
 *  - quality (number 1–100, default 85): Output quality (for lossy formats)
 */
export const convertImage: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const targetFormat = (params.targetFormat as string)?.toLowerCase() as SupportedFormat
  if (!targetFormat || !FORMAT_MAP[targetFormat]) {
    throw new Error(
      `Invalid targetFormat: "${params.targetFormat}". Supported: ${Object.keys(FORMAT_MAP).join(', ')}`
    )
  }

  const quality = typeof params.quality === 'number' ? params.quality : 85
  const { mimeType, ext } = FORMAT_MAP[targetFormat]

  onProgress(30)

  let pipeline = sharp(buffer)
  let outputBuffer: Buffer

  onProgress(50)

  switch (targetFormat) {
    case 'jpg':
    case 'jpeg':
      outputBuffer = await pipeline.jpeg({ quality }).toBuffer()
      break
    case 'png':
      outputBuffer = await pipeline.png({ compressionLevel: 6 }).toBuffer()
      break
    case 'webp':
      outputBuffer = await pipeline.webp({ quality }).toBuffer()
      break
    case 'avif':
      outputBuffer = await pipeline.avif({ quality }).toBuffer()
      break
    case 'gif':
      outputBuffer = await pipeline.gif().toBuffer()
      break
    case 'bmp':
      // sharp supports bmp via raw output → use toFormat
      outputBuffer = await pipeline.toFormat('bmp' as any).toBuffer()
      break
    case 'tiff':
      outputBuffer = await pipeline.tiff({ quality }).toBuffer()
      break
    default:
      throw new Error(`Unhandled format: ${targetFormat}`)
  }

  onProgress(100)

  return {
    buffer: outputBuffer,
    mimeType,
    filename: `converted.${ext}`,
  }
}
