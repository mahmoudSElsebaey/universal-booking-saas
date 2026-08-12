import mongoose from 'mongoose'
import app from './app.js'
import { env } from './config/env.js'

const start = async () => {
  try {
    await mongoose.connect(env.mongodbUri)
    console.log('✅ MongoDB connected')

    app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`)
      console.log(`📦 Environment: ${env.nodeEnv}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
