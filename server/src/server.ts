import mongoose from 'mongoose'
import app from './app.js'
import { env } from './config/env.js'

async function bootstrap() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.mongodbUri)
    console.log('[db] Connected to MongoDB')

    app.listen(env.port, () => {
      console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`)
    })
  } catch (err) {
    console.error('[db] Connection failed', err)
    process.exit(1)
  }
}

bootstrap()
