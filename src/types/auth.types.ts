export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthPayload {
  user: AuthUser
  token: string
}

export interface SignupBody {
  email: string
  name: string
  password: string
}

export interface LoginBody {
  email: string
  password: string
}

export type AuthMode = 'login' | 'signup'
