import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getSalleById, getSalleAvailability } from '../../services/salle.service'
import type { Salle, AvailabilityResponse } from '../../types/salle.types'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatPrice } from '../../utils/format'
import { formatDateFull, formatDateISO } from '../../utils/date'

export default function SalleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [salle, setSalle] = useState<Salle | null>(null)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()))

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getSalleById(id)
      .then(setSalle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    getSalleAvailability(id, selectedDate).then(setAvailability).catch(() => {})
  }, [id, selectedDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  if (error || !salle) {
    return (
      <div className="rounded-lg px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {error ?? 'Salle introuvable'}
      </div>
    )
  }

  const TIME_SLOTS = Array.from({ length: 33 }, (_, i) => 6 + i * 0.5) // 6, 6.5, 7, ..., 22

  function isSlotReserved(slot: number): boolean {
    if (!availability) return false
    return availability.reservations.some((r) => {
      const s = new Date(r.start)
      const e = new Date(r.end)
      const startDecimal = s.getHours() + s.getMinutes() / 60
      const endDecimal = (e.getHours() + e.getMinutes() / 60) || 24
      return slot >= startDecimal && slot < endDecimal
    })
  }

  function formatSlotLabel(slot: number): string {
    const h = Math.floor(slot)
    return slot % 1 !== 0 ? `${h}h30` : `${h}h`
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/salles" className="hover:text-indigo-400 transition-colors cursor-pointer">Salles</Link>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">{salle.label}</span>
      </nav>

      {/* Header */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-white">{salle.label}</h1>
              <Badge variant={salle.type === 'STUDIO' ? 'studio' : 'info'}>
                {salle.type === 'STUDIO' ? 'Studio' : 'Salle'}
              </Badge>
            </div>
            {salle.description && (
              <p className="text-sm text-slate-500 mt-1">{salle.description}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/reservations', { state: { salleId: salle.id } })}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.2)' }}
          >
            Réserver
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <InfoCard label="Capacité" value={`${salle.capacity} places`} />
          <InfoCard label="Tarif" value={`${formatPrice(salle.pricePerHour)}/h`} />
          <InfoCard label="Bâtiment" value={salle.building} />
        </div>
      </div>

      {/* Availability */}
      <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Disponibilités</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-sm text-white rounded-lg outline-none transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              colorScheme: 'dark',
            }}
          />
        </div>

        <p className="text-sm text-slate-500 mb-4">{formatDateFull(selectedDate)}</p>

        {/* Timeline */}
        <div className="flex gap-1 overflow-x-auto pb-2 flex-wrap">
          {TIME_SLOTS.map((slot) => {
            const reserved = isSlotReserved(slot)
            const isHalf = slot % 1 !== 0
            return (
              <div
                key={slot}
                className={`flex-shrink-0 h-10 rounded-md flex items-center justify-center font-medium transition-colors ${isHalf ? 'w-12 text-[10px]' : 'w-14 text-xs'}`}
                style={
                  reserved
                    ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                    : { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                }
                title={reserved ? 'Réservé' : 'Disponible'}
              >
                {formatSlotLabel(slot)}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }} />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }} />
            Réservé
          </span>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
