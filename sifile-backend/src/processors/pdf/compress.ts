import { PDFDocument } from 'pdf-lib'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

/**
 * Compresses a PDF using pdf-lib.
 *
 * Strategy:
 *  - Strip all document metadata (title, author, subject, keywords, producer, creator)
 *  - Re-save using object streams (`useObjectStreams: true`) which provides structural compression
 *
 * Note (v1 limitation): This does NOT re-encode embedded images at lower quality,
 * which would require a full PDF rendering pipeline (e.g. Ghostscript).
 * Object-stream compression is a good-enough first pass, especially for text-heavy PDFs.
 *
 * Supported params:
 *  - quality ('aggressive'|'balanced'|'conservative', default 'balanced'): Strategy hint
 *    Currently all strategies apply the same logic; reserved for future image re-encoding.
 */
export const compressPdf: ProcessorFn = async (input, params, onProgress) => {
  const buffer = Array.isArray(input) ? input[0] : input;
  onProgress(0)

  const strategy = typeof params.strategy === 'string' ? params.strategy : 'balanced'
  void strategy // Reserved for future use (image re-encoding per strategy)

  const pdfDoc = await PDFDocument.load(buffer, {
    // Ignore encryption errors on load
    ignoreEncryption: true,
  })

  onProgress(30)

  // Strip all metadata to reduce size
  pdfDoc.setTitle('')
  pdfDoc.setAuthor('')
  pdfDoc.setSubject('')
  pdfDoc.setKeywords([])
  pdfDoc.setProducer('SiFile')
  pdfDoc.setCreator('SiFile')

  onProgress(60)

  // Save with object streams for structural compression
  const compressed = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  })

  onProgress(100)

  const outputBuffer = Buffer.from(compressed)

  return {
    buffer: outputBuffer,
    mimeType: 'application/pdf',
    filename: 'compressed.pdf',
  }
}
