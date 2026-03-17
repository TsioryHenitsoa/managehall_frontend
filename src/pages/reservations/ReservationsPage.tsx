import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import WeekCalendar from '../../components/calendar/WeekCalendar'
import Spinner from '../../components/ui/Spinner'
import { getReservations } from '../../services/reservation.service'
import { getSalles } from '../../services/salle.service'
import type { Reservation } from '../../types/reservation.types'
import type { Salle } from '../../types/salle.types'
import NewReservationModal from './NewReservationModal'
import ReservationDetailModal from './ReservationDetailModal'

export default function ReservationsPage() {
  const location = useLocation()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baseDate, setBaseDate] = useState(new Date())
  const [salleFilter, setSalleFilter] = useState<string>('')

  // Modals
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [prefill, setPrefill] = useState<{ date?: Date; hour?: number; salleId?: string }>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resData, salleData] = await Promise.all([getReservations(), getSalles()])
      setReservations(resData)
      setSalles(salleData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle incoming salleId from navigation
  useEffect(() => {
    const state = location.state as { salleId?: string } | null
    if (state?.salleId) {
      setPrefill({ salleId: state.salleId })
      setShowNewModal(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const filtered = salleFilter
    ? reservations.filter((r) => r.salleId === salleFilter)
    : reservations

  function handleSlotClick(date: Date, hour: number) {
    setPrefill({ date, hour, salleId: salleFilter || undefined })
    setShowNewModal(true)
  }

  function handleReservationClick(reservation: Reservation) {
    setSelectedReservation(reservation)
  }

  function handleCreated(_reservation: Reservation) {
    setShowNewModal(false)
    loadData()
  }

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
          <h1 className="text-xl font-semibold text-white">Réservations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setPrefill({})
            setShowNewModal(true)
          }}
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
          Nouvelle réservation
        </button>
      </div>

      {/* Salle filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSalleFilter('')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
            !salleFilter ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
          style={
            !salleFilter
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
          Toutes les salles
        </button>
        {salles.map((s) => (
          <button
            key={s.id}
            onClick={() => setSalleFilter(s.id)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
              salleFilter === s.id ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            style={
              salleFilter === s.id
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
            {s.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <WeekCalendar
        baseDate={baseDate}
        reservations={filtered}
        onDateChange={setBaseDate}
        onSlotClick={handleSlotClick}
        onReservationClick={handleReservationClick}
      />

      {/* Modals */}
      <NewReservationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleCreated}
        prefill={prefill}
      />

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onUpdated={() => {
            setSelectedReservation(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
