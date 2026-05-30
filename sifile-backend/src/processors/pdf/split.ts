import { PDFDocument } from 'pdf-lib'
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
 * Parses a range string like "1-3,5,7-9" into an array of 0-indexed page numbers.
 */
function parseRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>()
  const parts = rangeStr.split(',').map((s) => s.trim())

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pages.add(i - 1) // convert to 0-indexed
        }
      }
    } else {
      const n = parseInt(part, 10)
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.add(n - 1)
    }
  }

  return [...pages].sort((a, b) => a - b)
}

/**
 * Splits a PDF into individual pages or equal-sized chunks, then zips them.
 *
 * Supported params:
 *  - mode ('single-pages'|'equal-chunks', default 'single-pages'): Split strategy
 *  - chunkSize (number, default 1): Number of pages per chunk (only for 'equal-chunks')
 *  - ranges (string, e.g. "1-3,5"): Only split the specified page ranges (1-indexed)
 *
 * Returns a ZIP file containing individual PDF files.
 */
export const splitPdf: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const mode = params.mode === 'equal-chunks' ? 'equal-chunks' : 'single-pages'
  const chunkSize = typeof params.chunkSize === 'number' && params.chunkSize > 0
    ? Math.floor(params.chunkSize)
    : 1
  const rangesParam = typeof params.ranges === 'string' ? params.ranges : null

  const sourcePdf = await PDFDocument.load(buffer)
  const totalPages = sourcePdf.getPageCount()

  if (totalPages === 0) throw new Error('PDF has no pages')

  onProgress(20)

  // Determine which pages to include
  const pageIndices = rangesParam
    ? parseRanges(rangesParam, totalPages)
    : Array.from({ length: totalPages }, (_, i) => i)

  // Build chunks
  const chunks: number[][] = []

  if (mode === 'single-pages') {
    for (const idx of pageIndices) {
      chunks.push([idx])
    }
  } else {
    // equal-chunks
    for (let i = 0; i < pageIndices.length; i += chunkSize) {
      chunks.push(pageIndices.slice(i, i + chunkSize))
    }
  }

  onProgress(30)

  // Build individual PDFs for each chunk
  const pdfBuffers: { name: string; data: Buffer }[] = []
  const totalChunks = chunks.length

  for (let ci = 0; ci < chunks.length; ci++) {
    const pageGroup = chunks[ci]
    const chunkDoc = await PDFDocument.create()
    const copiedPages = await chunkDoc.copyPages(sourcePdf, pageGroup)
    for (const page of copiedPages) chunkDoc.addPage(page)
    const bytes = await chunkDoc.save({ useObjectStreams: true })
    const name =
      mode === 'single-pages'
        ? `page-${(pageGroup[0] + 1).toString().padStart(4, '0')}.pdf`
        : `chunk-${(ci + 1).toString().padStart(3, '0')}.pdf`
    pdfBuffers.push({ name, data: Buffer.from(bytes) })

    // Progress: 30% → 85% across all chunks
    onProgress(30 + Math.floor(((ci + 1) / totalChunks) * 55))
  }

  onProgress(88)

  // ZIP all PDFs
  const zipBuffer = await createZipBuffer((archive) => {
    for (const { name, data } of pdfBuffers) {
      archive.append(data, { name })
    }
  })

  onProgress(100)

  return {
    buffer: zipBuffer,
    mimeType: 'application/zip',
    filename: 'split-pages.zip',
  }
}
