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

export const compareDocuments: ProcessorFn = async (input, params, onProgress) => {
  if (!Array.isArray(input) || input.length < 2) {
    throw new Error('Harap unggah minimal 2 file untuk dapat membandingkan dokumen.')
  }

  const file1 = input[0]
  const file2 = input[1]

  onProgress(10)

  const compareMode = params.compareMode || 'text'
  const detailLevel = params.detailLevel || 'medium'
  const language = params.language || 'Indonesian'

  onProgress(20)

  // Mapping parameter labels for the prompt
  const modeDesc = {
    text: 'perbedaan teks, perubahan kata, typo, dan konten tulisan',
    visual: 'tata letak (layout), pemformatan, ukuran margin, pergeseran letak gambar/logo, dan aspek visual',
    both: 'gabungan dari perbedaan teks (konten tulisan) dan aspek tata letak (visual)'
  }[compareMode as string] || 'perbedaan teks'

  const detailDesc = {
    low: 'ringkas (ringkasan umum perbedaan utama saja)',
    medium: 'sedang (analisis perbedaan per bagian/halaman)',
    high: 'sangat mendalam (perbandingan baris-demi-baris atau elemen-demi-elemen secara mendetail)'
  }[detailLevel as string] || 'sedang'

  const prompt = `Anda adalah asisten AI penganalisis dokumen profesional yang ahli dalam membandingkan file secara kritis.
Tugas Anda adalah membandingkan dua dokumen yang dilampirkan: Dokumen Pertama (File 1) dan Dokumen Kedua (File 2).

Analisislah perbedaan di antara keduanya berdasarkan parameter berikut:
1. **Fokus Perbandingan**: ${modeDesc}
2. **Tingkat Detail**: ${detailDesc}
3. **Bahasa**: ${language} (Wajib tulis seluruh laporan analisis dalam bahasa ini secara natural dan profesional)

Aturan Tambahan:
- Berikan output dalam format Markdown yang rapi dan profesional.
- Gunakan struktur heading yang jelas. Awali dengan "# Laporan Perbandingan Dokumen".
- Disarankan menyusun laporan dalam bentuk tabel perbandingan atau poin-poin terstruktur untuk bagian yang mengalami penambahan (+), pengurangan (-), atau modifikasi.
- Buat bagian ringkasan kesimpulan (Verdict/Summary) di bagian akhir laporan yang merangkum poin krusial dari perbedaan tersebut.
- JANGAN menyertakan penjelasan pembuka/penutup seperti "Tentu, ini perbandingannya:" atau "Berikut laporannya:". Langsung berikan output Markdown utama.`

  onProgress(35)

  const mimeType1 = detectMimeType(file1)
  const mimeType2 = detectMimeType(file2)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType1,
                data: file1.toString('base64'),
              }
            },
            {
              inlineData: {
                mimeType: mimeType2,
                data: file2.toString('base64'),
              }
            },
            { text: prompt }
          ]
        }
      ],
    })

    onProgress(85)

    const compareText = response.text || 'Gagal membandingkan kedua dokumen.'

    onProgress(100)

    return {
      buffer: Buffer.from(compareText, 'utf-8'),
      mimeType: 'text/markdown',
      filename: 'comparison.md',
      resultText: compareText
    }
  } catch (error) {
    console.error('Gemini Compare Failed:', error)
    throw new Error(`AI Comparison Error: ${(error as Error).message}`)
  }
}
