import mongoose from 'mongoose'
import app from '../src/app.js'
import { env } from '../src/config/env.js'

let isConnected = false

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return
  }

  mongoose.set('strictQuery', true)

  await mongoose.connect(env.mongodbUri)

  isConnected = true

  console.log('[db] Connected to MongoDB')
}

export default async function handler(req: any, res: any) {
  try {
    await connectDB()

    return app(req, res)
  } catch (error) {
    console.error('[db] Connection failed:', error)

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    })
  }
}