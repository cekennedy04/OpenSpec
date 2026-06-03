import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import { AnalysisResult, CleanlinessViolation, ErgonomicsIssue } from '@shared/types'
// Build the client lazily. If constructed at module load it would capture
// process.env.GEMINI_API_KEY before dotenv.config() runs in index.ts (ES
// module imports evaluate before the importer's body), leaving the key
// undefined and every analysis failing with an auth error.
const ANALYSIS_MODEL = 'gemini-1.5-flash'; // Lock to stable model name

let genAI: GoogleGenerativeAI | null = null
let modelCache: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

function getModel() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is missing. Ensure it is set in your environment variables.'
      )
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!, {
      apiVersion: 'v1'
    })
    console.log(`[Gemini Client] Initialized with apiVersion: 'v1'`)
  }
  if (modelCache) return modelCache;

  modelCache = genAI.getGenerativeModel({ 
    model: ANALYSIS_MODEL,
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
      responseMimeType: "application/json",
    }
  });
  return modelCache;
}

const ANALYSIS_PROMPT = `Analyze this hospital workspace image for compliance. Check:
CLEANLINESS: spilled food/drink, open food containers, unsanitary surfaces
ERGONOMICS: monitor height, keyboard angle, chair back support, wrist position, screen distance

IMPORTANT RULES:
- Only report a violation or issue when you can directly SEE evidence of a problem in the image.
- Do NOT report something as a problem just because it is out of frame, not visible, or cannot be assessed. A chair that is not in the photo, or a missing person whose wrist posture can't be judged, is NOT a violation — simply omit it.
- Do not speculate. If you cannot tell whether something is compliant, leave it out rather than flagging it.
- "passed" is true when the violations/issues array is empty (no observable problems). An item that is out of frame must never cause "passed" to be false.

Respond in this exact JSON format:
{
  "cleanliness": {
    "passed": true/false,
    "violations": [{"type": "string", "description": "string", "severity": "high/medium/low", "confidence": 0.0-1.0}]
  },
  "ergonomics": {
    "passed": true/false,
    "issues": [{"type": "string", "description": "string", "severity": "high/medium/low", "confidence": 0.0-1.0}]
  }
}`

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/webp'

function detectMediaType(buffer: Buffer): SupportedMediaType | null {
  // Detect the real format from the file's magic bytes. 
  // This prevents the API from rejecting uploads with incorrect MIME types.
  const hex = buffer.toString('hex', 0, 4)
  if (hex.startsWith('ffd8ff')) return 'image/jpeg'
  if (hex.startsWith('89504e47')) return 'image/png'
  if (hex.startsWith('52494646')) return 'image/webp'
  return null;
}

export async function analyzeWorkspaceImage(imagePath: string) {
  let imageData: Buffer
  try {
    imageData = await fs.readFile(imagePath)
  } catch {
    throw new Error(`Could not read uploaded image at "${imagePath}".`)
  }

  const mediaType = detectMediaType(imageData)
  if (!mediaType) {
    throw new Error(
      'Unsupported image format. Please upload a JPEG, PNG, or WebP image.'
    )
  }
  const base64Image = imageData.toString('base64')

  console.log(`[AnalysisService] Starting analysis for: ${imagePath} (${mediaType})`)
  const model = getModel()
  let parsedResult: AnalysisResult
  let text = ''

  try {
    const result = await model.generateContent([
      { text: ANALYSIS_PROMPT },
      {
        inlineData: {
          mimeType: mediaType,
          data: base64Image,
        },
      },
    ])

    if (!result.response) {
      throw new Error('The AI service returned an empty response. This may be due to safety filters.');
    }

    const response = await result.response
    text = response.text().trim()
  } catch (apiError) {
    console.error('Gemini API Error:', apiError)
    const message = apiError instanceof Error ? apiError.message : String(apiError)
    throw new Error(`AI Analysis Service Error: ${message}`)
  }

  console.log(`[AnalysisService] AI Response received. Validating JSON...`)
  try {
    // Extract JSON content even if the model surrounds it with markdown or text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in the AI response.');
    }
    
    parsedResult = JSON.parse(jsonMatch[0]) as AnalysisResult;
  } catch (e) {
    console.error('AI Raw Response:', text)
    throw new Error(`The AI returned a response that could not be parsed as JSON: ${e instanceof Error ? e.message : String(e)}`)
  }

  // More robust validation against the expected structure
  if (
    !parsedResult ||
    typeof parsedResult.cleanliness !== 'object' ||
    typeof parsedResult.ergonomics !== 'object' ||
    typeof parsedResult.cleanliness.passed !== 'boolean' ||
    !Array.isArray(parsedResult.cleanliness.violations) ||
    typeof parsedResult.ergonomics.passed !== 'boolean' ||
    !Array.isArray(parsedResult.ergonomics.issues)
  ) {
    throw new Error('The AI response was missing the expected cleanliness/ergonomics fields.')
  }

  console.log(`[AnalysisService] Analysis successful. Reporting ${parsedResult.cleanliness.violations.length} cleanliness violations and ${parsedResult.ergonomics.issues.length} ergonomic issues.`)

  parsedResult.cleanliness.violations.forEach((v: CleanlinessViolation) => {
    if (typeof v.type !== 'string' || typeof v.description !== 'string' || !['high', 'medium', 'low'].includes(v.severity) || typeof v.confidence !== 'number' || v.confidence < 0 || v.confidence > 1) {
      console.warn('[Analysis] Malformed cleanliness violation detected:', v);
    }
  });

  parsedResult.ergonomics.issues.forEach((i: ErgonomicsIssue) => {
    if (typeof i.type !== 'string' || typeof i.description !== 'string' || !['high', 'medium', 'low'].includes(i.severity) || typeof i.confidence !== 'number' || i.confidence < 0 || i.confidence > 1) {
      console.warn('[Analysis] Malformed ergonomics issue detected:', i);
    }
  });

  return {
    requestId: `req-${crypto.randomUUID()}`,
    ...parsedResult,
    timestamp: Date.now(),
  }
}
