import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import dotenv from 'dotenv'
import { reportGenerator } from './services/reportGenerator'
import { analyzeWorkspaceImage } from './services/analysisService'

dotenv.config()

// Diagnostic: Verify API Key is loaded (masked for security)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing from process.env. Check your .env file.');
} else {
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`✅ GEMINI_API_KEY loaded successfully: ${maskedKey}`);
}

const app: Express = express()
const PORT = process.env.PORT || 3000
const uploadDir = 'temp/uploads'

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      return cb(null, true)
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are supported.'))
  },
})

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173', // Default Vite port
      'http://localhost:5174', // Another common Vite port
      process.env.FRONTEND_URL, // Allow production URL from .env
    ].filter((o): o is string => !!o);

    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}))

app.use(express.json())

// Middleware to log all incoming requests for debugging
app.use((req, _res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ success: true, filePath: req.file.path, filename: req.file.filename })
})

app.post('/api/analyze', async (req, res) => {
  const { imagePath } = req.body
  if (!imagePath) return res.status(400).json({ error: 'Image path required' })
  try {
    // Perform AI analysis
    const analysisResult = await analyzeWorkspaceImage(imagePath)
    res.json({ success: true, data: analysisResult })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Analysis failed',
    })
  } finally {
    // Privacy compliance: Delete the temporary file immediately after processing
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    } catch (cleanupError) {
      console.error('Cleanup warning (image file was not removed):', cleanupError)
    }
  }
})

app.post('/api/generate-report', async (req, res) => {
  const { analysisResult } = req.body
  if (!analysisResult) return res.status(400).json({ error: 'Analysis result required' })
  try {
    const report = reportGenerator.generateReport(analysisResult)
    res.json({ success: true, data: report })
  } catch (error) {
    console.error('Report generation error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Report generation failed',
    })
  }
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Unhandled Error] ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
})

// Use 0.0.0.0 to ensure it's accessible via both localhost and 127.0.0.1
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`✓ Backend running on port ${PORT}`)
  console.log(`✓ Testing link: http://localhost:${PORT}/api/health`)
})

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`)
    console.error(`This usually means another instance of the server is still running.`)
    console.error(`To fix this, kill the process using port ${PORT} or change the PORT in your .env file.\n`)
    process.exit(1)
  }
})
