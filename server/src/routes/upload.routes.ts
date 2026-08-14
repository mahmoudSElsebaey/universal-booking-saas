import { Router } from 'express'
import type { Request, Response } from 'express'
import { Readable } from 'stream'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { uploadImage } from '../middlewares/uploadMiddleware.js'
import { asyncHandler } from '../middlewares/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { cloudinary, hasCloudinary } from '../config/cloudinary.js'
import { env } from '../config/env.js'

const router = Router()

router.use(authMiddleware)

router.post(
  '/image',
  uploadImage.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded')
    }

    if (!hasCloudinary()) {
      throw new ApiError(
        503,
        'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      )
    }

    const result = await new Promise<{
      secure_url: string
      public_id: string
      bytes: number
      format: string
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: env.cloudinaryFolder,
          resource_type: 'image',
          overwrite: false,
        },
        (err, uploaded) => {
          if (err || !uploaded) {
            reject(err || new Error('Cloudinary upload failed'))
            return
          }

          resolve({
            secure_url: uploaded.secure_url!,
            public_id: uploaded.public_id!,
            bytes: uploaded.bytes || 0,
            format: uploaded.format || '',
          })
        }
      )

      Readable.from(req.file!.buffer).pipe(stream)
    })

    return res.status(201).json({
      success: true,
      message: 'Image uploaded',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        mimetype: req.file.mimetype,
      },
    })
  })
)

export default router