import { useState, type FormEvent, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { AuthMode } from '../../types/auth.types'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [animating, setAnimating] = useState(false)

  const { login, signup, loading, error, setError } = useAuth()

  function switchMode(next: AuthMode) {
    if (next === mode) return
    setAnimating(true)
    setTimeout(() => {
      setMode(next)
      setEmail('')
      setName('')
      setPassword('')
      setError(null)
      setAnimating(false)
    }, 180)
  }

  useEffect(() => {
    setError(null)
  }, [mode, setError])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'login') {
      await login({ email, password })
    } else {
      await signup({ email, name, password })
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020917]">

      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Top-left accent glow */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Bottom-right accent glow */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{ filter: 'drop-shadow(0 0 48px rgba(59,130,246,0.12))' }}
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              boxShadow: '0 0 32px rgba(59,130,246,0.5)',
            }}>
            {/* Building / Hall icon */}
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V7l7-4 7 4v14" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-4a3 3 0 016 0v4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hall'Amino</h1>
          <p className="text-blue-400/70 text-sm mt-1 tracking-wide">
            {mode === 'login' ? '' : 'Créez votre accès à la plateforme'}
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(['login', 'signup'] as AuthMode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={
                  mode === tab
                    ? {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                      }
                    : { color: 'rgba(255,255,255,0.4)' }
                }
              >
                {tab === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-5 transition-all duration-180 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            style={{ transition: 'opacity 180ms ease, transform 180ms ease' }}
          >
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-blue-300/80 uppercase tracking-widest mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-blue-400/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="RABEZA Victor"
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(59,130,246,0.7)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-blue-300/80 uppercase tracking-widest mb-2">
                Adresse email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-blue-400/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(59,130,246,0.7)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-blue-300/80 uppercase tracking-widest">
                  Mot de passe
                </label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-blue-400/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-white placeholder-white/20 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(59,130,246,0.7)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-4 flex items-center text-blue-400/50 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#fca5a5',
                }}
              >
                <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #6366f1 100%)',
                boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(59,130,246,0.4)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Connexion...' : 'Création du compte...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider + switch mode */}
          <div className="mt-6 text-center">
            <p className="text-white/30 text-sm">
              {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                {mode === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs mt-6">
          © {new Date().getFullYear()} Hall Amino — Tous droits réservés
        </p>
      </div>
    </div>
  )
}
