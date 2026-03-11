import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('hall_amino_token')
    localStorage.removeItem('hall_amino_user')
    navigate('/auth')
  }

  const stored = localStorage.getItem('hall_amino_user')
  const user = stored ? JSON.parse(stored) : null

  return (
    <div className="min-h-screen bg-[#020917] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bienvenue, {user?.name ?? 'utilisateur'} 👋
        </h1>
        <p className="text-blue-400/70 mb-8">{user?.email}</p>
        <button
          onClick={logout}
          className="px-6 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            boxShadow: '0 4px 24px rgba(59,130,246,0.4)',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
