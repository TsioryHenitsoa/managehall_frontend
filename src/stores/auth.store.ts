import { create } from 'zustand'
import type { AuthUser, LoginBody, SignupBody } from '../types/auth.types'
import * as authService from '../services/auth.service'

const TOKEN_KEY = 'hall_amino_token'
const USER_KEY = 'hall_amino_user'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (body: LoginBody) => Promise<void>
  signup: (body: SignupBody) => Promise<void>
  logout: () => void
  setError: (error: string | null) => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(USER_KEY)
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser
        set({ user, token, isAuthenticated: true })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
  },

  login: async (body: LoginBody) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await authService.login(body)
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token, isAuthenticated: true, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur de connexion', loading: false })
      throw e
    }
  },

  signup: async (body: SignupBody) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await authService.signup(body)
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token, isAuthenticated: true, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Erreur lors de l'inscription", loading: false })
      throw e
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  setError: (error: string | null) => set({ error }),
}))
