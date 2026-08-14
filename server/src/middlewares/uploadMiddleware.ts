import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

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