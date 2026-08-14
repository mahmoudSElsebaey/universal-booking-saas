import { api, API_ORIGIN } from './api'

/**
 * Upload an image file.
 * - With Cloudinary configured on API → full https://res.cloudinary.com/... URL
 * - Local dev without Cloudinary → /uploads/... (resolved against API origin)
 */
export const uploadApi = {
  image: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    // Do NOT set Content-Type manually — axios interceptor strips it so the
    // browser can add the multipart boundary. Setting multipart/form-data alone breaks multer.
    const { data } = await api.post<{
      success: boolean
      data: { url: string; filename?: string; publicId?: string }
    }>('/uploads/image', form)
    return data.data
  },
}

/** Resolve stored image path/URL to a browser-loadable URL */
export function resolveMediaUrl(src?: string | null): string {
  if (!src) return ''
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:')
  ) {
    return src
  }
  // Local relative paths like /uploads/xxx.jpg
  if (!API_ORIGIN) return src
  if (src.startsWith('/')) return `${API_ORIGIN}${src}`
  return `${API_ORIGIN}/${src}`
}
