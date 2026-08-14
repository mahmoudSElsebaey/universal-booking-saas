import axios from 'axios'

/**
 * API base URL.
 * - Development: falls back to local backend if VITE_API_URL is unset.
 * - Production (Vercel): VITE_API_URL MUST be set; otherwise requests fail fast
 *   instead of silently hitting localhost.
 */
const isDev = import.meta.env.DEV
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isDev ? 'http://localhost:5000/api/v1' : '')

/** Origin without /api/v1 — used for /uploads static files in local dev */
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '')

if (!API_URL) {
  console.error(
    '[Bookora] VITE_API_URL is not set. Set it in your hosting env (e.g. Vercel) to your API base URL including /api/v1.'
  )
}

export const api = axios.create({
  baseURL: API_URL || undefined,
  withCredentials: true, // send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token + fix FormData Content-Type (must include boundary)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Critical: let the browser set multipart boundary for FormData
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete (config.headers as any)['Content-Type']
      delete (config.headers as any)['content-type']
    }
  }
  return config
})

// Auto refresh on 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Public pages without login — don't attempt refresh
      if (!localStorage.getItem('accessToken')) {
        return Promise.reject(error)
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
