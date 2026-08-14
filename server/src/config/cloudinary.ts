import { v2 as cloudinary } from 'cloudinary'
import { env, hasCloudinary } from './env.js'

if (hasCloudinary()) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  })
}

export { cloudinary, hasCloudinary }
