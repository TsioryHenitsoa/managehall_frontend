import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store.ts'
import type { AuthMode } from '../../types/auth.types.ts'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const { login, signup, loading, error, setError } = useAuthStore()
  const navigate = useNavigate()

  function switchMode(next: AuthMode) {
    if (next === mode || transitioning) return
    setTransitioning(true)
    setError(null)

    // Phase 1: slide out
    if (formRef.current) {
      formRef.current.style.opacity = '0'
      formRef.current.style.transform = next === 'signup' ? 'translateX(-20px)' : 'translateX(20px)'
    }

    // Phase 2: swap & slide in from opposite side
    setTimeout(() => {
      setMode(next)
      setEmail('')
      setName('')
      setPassword('')

      requestAnimationFrame(() => {
        if (formRef.current) {
          formRef.current.style.transform = next === 'signup' ? 'translateX(20px)' : 'translateX(-20px)'
          requestAnimationFrame(() => {
            if (formRef.current) {
              formRef.current.style.opacity = '1'
              formRef.current.style.transform = 'translateX(0)'
            }
            setTransitioning(false)
          })
        }
      })
    }, 200)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await signup({ email, name, password })
      }
      navigate('/dashboard', { replace: true })
    } catch {
      // error handled by store
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#060B18]">

      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(rgba(148,163,184,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Orb top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        />
        {/* Orb bottom-left */}
        <div
          className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        {/* Center wash */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 animate-slide-in">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 animate-float"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #3b82f6 100%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.1)',
            }}>
            <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="none">
              <rect x="5" y="6" width="4" height="20" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="23" y="6" width="4" height="20" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="9" y="13" width="14" height="4" rx="1.5" fill="currentColor" opacity="0.7" />
              <path d="M15 5a1 1 0 011-1v0a1 1 0 011 1v2a1 1 0 01-1 1v0a1 1 0 01-1-1V5z" fill="currentColor" opacity="0.4" />
              <path d="M12 3.5a0.75 0.75 0 011.5 0v1.5a0.75 0.75 0 01-1.5 0V3.5z" fill="currentColor" opacity="0.25" />
              <path d="M18.5 3.5a0.75 0.75 0 011.5 0v1.5a0.75 0.75 0 01-1.5 0V3.5z" fill="currentColor" opacity="0.25" />
            </svg>
          </div>

          <h1 className="text-[28px] font-bold text-white tracking-tight">
            Hall<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #818cf8, #60a5fa)' }}>&apos;</span>Amino
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 tracking-wide">
            Gestion de salles &amp; studio
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          {/* Tab switcher */}
          <div className="relative flex rounded-xl p-1 mb-7" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="absolute top-1 bottom-1 rounded-lg tab-slider"
              style={{
                width: 'calc(50% - 4px)',
                left: mode === 'login' ? '4px' : 'calc(50%)',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              }}
            />
            {(['login', 'signup'] as AuthMode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className="relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-300 cursor-pointer rounded-lg"
                style={{ color: mode === tab ? '#fff' : 'rgba(255,255,255,0.35)' }}
              >
                {tab === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-4"
            style={{ transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Name — animated height */}
            <div
              style={{
                maxHeight: mode === 'signup' ? '80px' : '0',
                opacity: mode === 'signup' ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
                marginBottom: mode === 'signup' ? '0' : '-16px',
              }}
            >
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required={mode === 'signup'}
                  className="auth-input"
                  tabIndex={mode === 'signup' ? 0 : -1}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="auth-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  style={{ paddingRight: '44px' }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] animate-slide-in"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: '#f87171',
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || transitioning}
              className="relative w-full py-3 rounded-xl font-semibold text-[14px] text-white cursor-pointer overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1) inset',
                transition: 'box-shadow 0.3s ease, transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.2) inset'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1) inset'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)' }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Connexion...' : 'Création...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Switch mode link */}
          <div className="mt-6 text-center">
            <span className="text-[13px] text-slate-500">
              {mode === 'login' ? 'Nouveau ici ?' : 'Déjà un compte ?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
              </button>
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-[11px] mt-8 tracking-wide">
          &copy; {new Date().getFullYear()} Hall&apos;Amino
        </p>
      </div>
    </div>
  )
}
