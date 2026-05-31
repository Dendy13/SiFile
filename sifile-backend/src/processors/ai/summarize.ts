import { GoogleGenAI } from '@google/genai'
import { detectMimeType } from './utils'

type ProcessorFn = (
  input: Buffer | Buffer[],
  params: Record<string, unknown>,
  onProgress: (pct: number) => void
) => Promise<{ buffer: Buffer; mimeType: string; filename: string; resultText?: string }>

const project = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'sifile-app'
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const ai = new GoogleGenAI({ project, location, vertexai: true })

export const summarizeDocument: ProcessorFn = async (input, params, onProgress) => {
  const fileBuffer = Array.isArray(input) ? input[0] : input

  onProgress(10)

  const summaryLength = params.summaryLength || 'medium'
  const format = params.format || 'key-takeaways'
  const language = params.language || 'Indonesian'

  onProgress(20)

  // Mapping parameter labels for the prompt
  const lengthDesc = {
    short: 'ringkas (~1 paragraf singkat)',
    medium: 'sedang (~3 paragraf atau poin-poin utama)',
    detailed: 'detail dan mendalam (mencakup semua informasi penting secara lengkap)'
  }[summaryLength as string] || 'sedang'

  const formatDesc = {
    bulletpoints: 'daftar poin-poin bullet (bullet list)',
    paragraph: 'paragraf narasi yang mengalir lancar (prose)',
    'key-takeaways': 'poin-poin temuan/kesimpulan penting bernomor'
  }[format as string] || 'poin-poin temuan/kesimpulan penting bernomor'

  const prompt = `Anda adalah asisten AI penganalisis dokumen profesional.
Tugas Anda adalah membaca dokumen yang dilampirkan dan menyusun ringkasan (summary) berkualitas tinggi.

Patuhi konfigurasi parameter berikut:
1. **Panjang Ringkasan**: ${lengthDesc}
2. **Format Output**: ${formatDesc}
3. **Bahasa**: ${language} (Wajib tulis seluruh ringkasan dalam bahasa ini secara natural dan profesional)

Aturan Tambahan:
- Berikan output dalam format Markdown yang rapi dan terstruktur dengan baik.
- Gunakan struktur heading yang jelas, misalnya dimulai dengan judul utama "# Ringkasan Dokumen" atau judul yang relevan dengan isi dokumen.
- Sorot data numerik, tanggal penting, atau nama entitas kunci jika ada.
- Jangan mengarang informasi di luar isi dokumen (no hallucinations). Jika dokumen tidak dapat dibaca atau kosong, beritahukan dengan jelas dan profesional.
- JANGAN menyertakan penjelasan pembuka/penutup seperti "Tentu, ini ringkasannya:" atau "Semoga membantu!". Langsung berikan output Markdown utama.`

  onProgress(35)

  const mimeType = detectMimeType(fileBuffer)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBuffer.toString('base64'),
              }
            },
            { text: prompt }
          ]
        }
      ],
    })

    onProgress(85)

    const summaryText = response.text || 'Gagal menghasilkan ringkasan dari model.'

    onProgress(100)

    return {
      buffer: Buffer.from(summaryText, 'utf-8'),
      mimeType: 'text/markdown',
      filename: 'summary.md',
      resultText: summaryText
    }
  } catch (error) {
    console.error('Gemini Summarize Failed:', error)
    throw new Error(`AI Summarization Error: ${(error as Error).message}`)
  }
}
