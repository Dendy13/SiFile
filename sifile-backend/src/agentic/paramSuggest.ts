import { GoogleGenAI, Type, Schema } from '@google/genai'

export interface SuggestionResult {
  params: Record<string, unknown>
  rationale: string
}

export interface FileAnalysis {
  mimeType: string
  sizeBytes: number
  width?: number    // for images
  height?: number   // for images
  pageCount?: number // for PDFs
  originalName?: string
}

// Initialize Vertex AI Client
// This relies on Application Default Credentials (ADC)
const project = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'sifile-app'
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const ai = new GoogleGenAI({ project, location, vertexai: true })

// Define the structured output schema for the AI response
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    params: {
      type: Type.OBJECT,
      description: "The recommended parameters for the file operation. Format keys and values depending on the operation.",
    },
    rationale: {
      type: Type.STRING,
      description: "A short, professional explanation of why these parameters were chosen based on the file metadata. Max 2 sentences.",
    }
  },
  required: ["params", "rationale"],
}

// ─────────────────────────────────────────────
// Fallback Rule-based Implementations
// ─────────────────────────────────────────────

function ruleBasedSuggestPdfCompress(analysis: FileAnalysis): SuggestionResult {
  const sizeMB = analysis.sizeBytes / (1024 * 1024)
  if (sizeMB > 20) return { params: { quality: 50, strategy: 'aggressive', downscaleDpi: 120 }, rationale: `Large file (${sizeMB.toFixed(1)} MB). Aggressive compression.` }
  if (sizeMB > 5) return { params: { quality: 65, strategy: 'balanced', downscaleDpi: 150 }, rationale: `Medium file. Balanced compression.` }
  return { params: { quality: 80, strategy: 'conservative', downscaleDpi: 200 }, rationale: `Small file. Light compression.` }
}

function ruleBasedSuggestImageCompress(analysis: FileAnalysis): SuggestionResult {
  const sizeMB = analysis.sizeBytes / (1024 * 1024)
  const quality = sizeMB > 5 ? 72 : sizeMB > 2 ? 80 : 85
  return {
    params: { quality, progressive: true, stripExif: true },
    rationale: `Compressing with quality ${quality} and stripping metadata to save space.`,
  }
}

function ruleBasedSuggestDocSummarize(analysis: FileAnalysis): SuggestionResult {
  return {
    params: {
      summaryLength: 'medium',
      format: 'key-takeaways',
      language: 'Indonesian',
    },
    rationale: 'Rekomendasi ringkasan dengan panjang medium berformat poin penting dalam Bahasa Indonesia.',
  }
}

function ruleBasedSuggestDocCompare(analysis: FileAnalysis): SuggestionResult {
  return {
    params: {
      compareMode: 'text',
      detailLevel: 'medium',
      language: 'Indonesian',
    },
    rationale: 'Rekomendasi perbandingan teks dengan detail sedang dalam Bahasa Indonesia.',
  }
}

// Add other rule-based fallbacks as needed...
function getFallbackSuggestion(operation: string, analysis: FileAnalysis): SuggestionResult {
  switch (operation) {
    case 'pdf-compress': return ruleBasedSuggestPdfCompress(analysis)
    case 'image-compress': return ruleBasedSuggestImageCompress(analysis)
    case 'doc-summarize': return ruleBasedSuggestDocSummarize(analysis)
    case 'doc-compare': return ruleBasedSuggestDocCompare(analysis)
    default: return { params: {}, rationale: 'Using optimal default parameters for this file.' }
  }
}

// ─────────────────────────────────────────────
// Main AI Dispatcher
// ─────────────────────────────────────────────

/**
 * Get parameter suggestions using Vertex AI (Gemini).
 * Falls back to rule-based logic if API call fails or is unauthenticated.
 */
export async function getSuggestions(
  operation: string,
  analysis: FileAnalysis
): Promise<SuggestionResult> {
  const prompt = `
You are an expert file processing AI for SiFile.
Analyze this file and recommend the BEST operation parameters.
Operation: ${operation}
File Metadata:
- MIME Type: ${analysis.mimeType}
- Size: ${(analysis.sizeBytes / 1024 / 1024).toFixed(2)} MB
${analysis.width ? `- Dimensions: ${analysis.width}x${analysis.height}` : ''}
${analysis.pageCount ? `- PDF Pages: ${analysis.pageCount}` : ''}

Rules:
1. Suggest optimal parameters for this operation to balance quality and file size.
2. If it's an image resize, do NOT suggest hardcoded dimensions unless necessary. Provide 'width'/'height' or 'targetFormat'.
3. Your rationale MUST be user-facing, professional, and max 2 sentences.
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2, // Low temp for more deterministic parameters
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text in response");

    const parsed = JSON.parse(text) as SuggestionResult;
    return parsed;
  } catch (error) {
    console.warn(`Vertex AI Suggestion Failed (falling back to rules):`, (error as Error).message);
    return getFallbackSuggestion(operation, analysis);
  }
}
