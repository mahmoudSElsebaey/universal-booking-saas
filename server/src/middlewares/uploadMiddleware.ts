import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { ApiError } from '../utils/ApiError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const uploadsDir = path.resolve(__dirname, '../../uploads')

const memoryStorage = multer.memoryStorage()

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        'Only JPEG, PNG, WebP, or GIF images are allowed'
      ) as any
    )
  }

  cb(null, true)
}

export const uploadImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
})

// Create the local uploads directory only during development.
// Production/Vercel uses Cloudinary.
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
}