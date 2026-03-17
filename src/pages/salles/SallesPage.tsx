import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSalles, deleteSalle } from '../../services/salle.service'
import { useToastStore } from '../../stores/toast.store.ts'
import type { Salle, SalleType } from '../../types/salle.types'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { formatPrice } from '../../utils/format'
import SalleFormModal from './SalleFormModal.tsx'

type FilterType = 'ALL' | SalleType

export default function SallesPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [salles, setSalles] = useState<Salle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingSalle, setEditingSalle] = useState<Salle | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [minCapacity, setMinCapacity] = useState('')

  function loadSalles() {
    setLoading(true)
    getSalles()
      .then(setSalles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSalles()
  }, [])

  async function handleDelete(salle: Salle) {
    if (deletingId === salle.id) {
      try {
        await deleteSalle(salle.id)
        addToast('success', `"${salle.label}" supprimée`)
        loadSalles()
      } catch (e) {
        addToast('error', e instanceof Error ? e.message : 'Erreur lors de la suppression')
      }
      setDeletingId(null)
    } else {
      setDeletingId(salle.id)
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  const capacityMin = minCapacity ? Number(minCapacity) : 0
  const filtered = salles
    .filter((s) => filter === 'ALL' || s.type === filter)
    .filter((s) => s.type === 'STUDIO' || s.capacity >= capacityMin)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Salles</h1>
          <p className="text-sm text-slate-500 mt-0.5">{salles.length} salle{salles.length > 1 ? 's' : ''} enregistrée{salles.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditingSalle(null); setShowFormModal(true) }}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 0 20px rgba(99,102,241,0.2)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.2)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une salle
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2">
          {([
            { value: 'ALL', label: 'Toutes' },
            { value: 'SALLE', label: 'Salles' },
            { value: 'STUDIO', label: 'Studios' },
          ] as { value: FilterType; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                filter === value
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                filter === value
                  ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.1))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      boxShadow: '0 0 15px rgba(99,102,241,0.1)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <span className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">Capacité min.</label>
          <input
            type="number"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            placeholder="Ex: 20"
            min={1}
            className="w-20 px-2.5 py-1.5 text-sm text-white rounded-lg outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {capacityMin > 0 && (
            <span className="text-xs text-slate-600">
              ({filtered.length} résultat{filtered.length > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune salle trouvée"
          description="Changez vos filtres ou ajoutez une nouvelle salle."
          action={{ label: 'Ajouter une salle', onClick: () => { setEditingSalle(null); setShowFormModal(true) } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((salle) => (
            <div key={salle.id} className="group rounded-xl p-5 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <Link to={`/salles/${salle.id}`} className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors cursor-pointer">
                  {salle.label}
                </Link>
                <Badge variant={salle.type === 'STUDIO' ? 'studio' : 'info'}>
                  {salle.type === 'STUDIO' ? 'Studio' : 'Salle'}
                </Badge>
              </div>

              {salle.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{salle.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  {salle.capacity} places
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatPrice(salle.pricePerHour)}/h
                </span>
              </div>

              {/* CRUD Actions */}
              <div className="flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <Link
                  to={`/salles/${salle.id}`}
                  className="flex-1 text-center px-3 py-1.5 text-xs text-slate-400 rounded-lg transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  Voir
                </Link>
                <button
                  onClick={() => { setEditingSalle(salle); setShowFormModal(true) }}
                  className="flex-1 px-3 py-1.5 text-xs text-indigo-400 rounded-lg transition-all cursor-pointer"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)' }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(salle)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    deletingId === salle.id ? 'text-white' : 'text-red-400'
                  }`}
                  style={
                    deletingId === salle.id
                      ? { background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }
                      : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }
                  }
                  onMouseEnter={(e) => { if (deletingId !== salle.id) e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={(e) => { if (deletingId !== salle.id) e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                >
                  {deletingId === salle.id ? 'Confirmer' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <SalleFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingSalle(null) }}
        onSaved={loadSalles}
        salle={editingSalle}
      />
    </div>
  )
}
