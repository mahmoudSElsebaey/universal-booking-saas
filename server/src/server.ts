import mongoose from 'mongoose'
import app from './app.js'
import { env } from './config/env.js'

async function bootstrap() {
  try {
    mongoose.set('strictQuery', true)

    console.log('[DB TEST] Starting MongoDB connection...')
    console.log('[DB TEST] URI exists:', Boolean(env.mongodbUri))
    console.log('[DB TEST] URI prefix:', env.mongodbUri.substring(0, 25))

    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })

    console.log('[DB TEST] MongoDB CONNECTED')
    console.log('[DB TEST] ReadyState:', mongoose.connection.readyState)

    app.listen(env.port, () => {
      console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`)
    })
  } catch (error) {
    console.error('[DB TEST] MongoDB CONNECTION FAILED')
    console.error(error)

    process.exit(1)
  }
}

bootstrap()