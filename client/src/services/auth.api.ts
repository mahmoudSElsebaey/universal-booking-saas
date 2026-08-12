import { api } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  avatar?: string
  isEmailVerified: boolean
  businessId?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      payload
    )
    return data.data
  },

  login: async (payload: LoginPayload) => {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      payload
    )
    return data.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  me: async () => {
    const { data } = await api.get<{ success: boolean; data: User }>('/auth/me')
    return data.data
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },
}
