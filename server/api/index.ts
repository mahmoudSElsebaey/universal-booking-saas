import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel serverless entry.
 * Lazy-import app so config/import errors return JSON instead of FUNCTION_INVOCATION_FAILED.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { connectDB } = await import('../src/config/db.js')
    const { assertProdConfig } = await import('../src/config/env.js')
    const { default: app } = await import('../src/app.js')

    try {
      assertProdConfig()
      await connectDB()
    } catch (err: any) {
      console.error('[serverless] bootstrap failed', err)
      res.status(503).json({
        success: false,
        message: err?.message || 'Service unavailable',
      })
      return
    }

    // Express application is a request listener (req, res)
    app(req as any, res as any)
  } catch (err: any) {
    console.error('[serverless] fatal', err)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err?.message || 'Internal server error',
        hint: 'Check Vercel Environment Variables and Function Logs',
      })
    }
  }
}
