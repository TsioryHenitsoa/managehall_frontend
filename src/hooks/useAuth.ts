import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/auth.service'
import type { AuthUser, LoginBody, SignupBody } from '../types/auth.types'

const TOKEN_KEY = 'hall_amino_token'
const USER_KEY = 'hall_amino_user'

export function useAuth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storedUser = localStorage.getItem(USER_KEY)
  const [user, setUser] = useState<AuthUser | null>(
    storedUser ? (JSON.parse(storedUser) as AuthUser) : null
  )

  function saveSession(token: string, authUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }

  async function login(body: LoginBody) {
    setLoading(true)
    setError(null)
    try {
      const { token, user: authUser } = await authService.login(body)
      saveSession(token, authUser)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function signup(body: SignupBody) {
    setLoading(true)
    setError(null)
    try {
      const { token, user: authUser } = await authService.signup(body)
      saveSession(token, authUser)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    navigate('/auth')
  }

  return { user, loading, error, login, signup, logout, setError }
}
