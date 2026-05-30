import { PDFDocument } from 'pdf-lib'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string }>

/**
 * Merges multiple PDF files into a single PDF.
 */
export const mergePdf: ProcessorFn = async (input, params, onProgress) => {
  onProgress(0)

  const buffers = Array.isArray(input) ? input : [input]
  
  if (buffers.length === 0) {
    throw new Error('No files provided for merge')
  }

  onProgress(10)

  const mergedPdf = await PDFDocument.create()

  for (let i = 0; i < buffers.length; i++) {
    const pdfDoc = await PDFDocument.load(buffers[i])
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
    
    // Progress up to 80%
    onProgress(10 + Math.floor((i + 1) / buffers.length * 70))
  }

  const pdfBytes = await mergedPdf.save()
  const outputBuffer = Buffer.from(pdfBytes)

  onProgress(100)

  return {
    buffer: outputBuffer,
    mimeType: 'application/pdf',
    filename: 'merged.pdf',
  }
}
