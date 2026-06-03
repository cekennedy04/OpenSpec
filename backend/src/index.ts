import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { reportGenerator } from './services/reportGenerator'
import { analyzeWorkspaceImage } from './services/analysisService'

dotenv.config()

// Diagnostic: Verify API Key is loaded (masked for security)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing from process.env. Check your .env file.');
} else {
  const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '****';
  console.log(`✅ GEMINI_API_KEY loaded successfully: ${maskedKey}`);
}

const app: Express = express()
const PORT = process.env.PORT || 3000
const uploadDir = path.join(process.cwd(), 'temp', 'uploads')

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  })
})

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  // Return only the relative path for security and portability
  const relativePath = path.relative(process.cwd(), req.file.path);
  res.json({ success: true, filePath: relativePath, filename: req.file.filename })
})

app.post('/api/analyze', async (req, res) => {
  const { imagePath } = req.body
  if (!imagePath) return res.status(400).json({ error: 'Image path required' })

  // Security: Prevent path traversal by ensuring the path is within the upload directory
  const absolutePath = path.resolve(process.cwd(), imagePath)
  if (!absolutePath.startsWith(uploadDir)) {
    return res.status(403).json({ error: 'Unauthorized file access' })
  }

  try {
    // Perform AI analysis
    const analysisResult = await analyzeWorkspaceImage(absolutePath)
    res.json({ success: true, data: analysisResult })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Analysis failed',
    })
  } finally {
    // Privacy compliance: Ensure the file is removed even if analysis fails
    try {
      if (absolutePath && fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath)
        console.log(`[Cleanup] Successfully removed temporary file: ${absolutePath}`)
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
