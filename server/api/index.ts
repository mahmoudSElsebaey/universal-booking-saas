import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../src/app.js'
import { connectDB } from '../src/config/db.js'

/**
 * Vercel serverless entry — Express app as a single function.
 * Local/Railway still use src/server.ts with app.listen().
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB()
  } catch (err) {
    console.error('[db] serverless connect failed', err)
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
    })
    return
  }

  // Express handles the Node req/res pair
  return app(req as any, res as any)
}
