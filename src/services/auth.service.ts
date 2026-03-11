import { apiRequest } from './api.service'
import type { AuthPayload, LoginBody, SignupBody } from '../types/auth.types'

export async function signup(body: SignupBody): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/signup', { method: 'POST', body })
}

export async function login(body: LoginBody): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/login', { method: 'POST', body })
}
