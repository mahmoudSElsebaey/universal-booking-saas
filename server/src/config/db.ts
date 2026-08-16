import mongoose from 'mongoose'
import { env } from './env.js'

declare global {
  // Reuse connection across warm serverless invocations
  // eslint-disable-next-line no-var
  var __bookoraMongoosePromise: Promise<typeof mongoose> | undefined
}

/**
 * Connect to MongoDB with caching for Vercel serverless.
 * Safe to call on every request — reuses an existing connection.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose
  }

  if (!global.__bookoraMongoosePromise) {
    mongoose.set('strictQuery', true)
    global.__bookoraMongoosePromise = mongoose.connect(env.mongodbUri, {
      // Fail fast on serverless cold start issues
      serverSelectionTimeoutMS: 10000,
    })
  }

  try {
    await global.__bookoraMongoosePromise
  } catch (err) {
    global.__bookoraMongoosePromise = undefined
    throw err
  }

  return mongoose
}