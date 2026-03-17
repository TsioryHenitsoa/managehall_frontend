import { useEffect, useState, useMemo } from 'react'
import Spinner from '../../components/ui/Spinner.tsx'
import Badge from '../../components/ui/Badge.tsx'
import { getReservations } from '../../services/reservation.service.ts'
import { getSalles } from '../../services/salle.service.ts'
import { useToastStore } from '../../stores/toast.store.ts'
import type { Reservation } from '../../types/reservation.types.ts'
import type { Salle } from '../../types/salle.types.ts'
import { formatPrice, getPaymentStatus, getPaymentStatusLabel } from '../../utils/format.ts'
import { formatDate, formatTime } from '../../utils/date.ts'
import ReservationDetailModal from '../reservations/ReservationDetailModal.tsx'

type StatusFilter = 'all' | 'CONFIRMED' | 'CANCELLED'
type PaymentFilter = 'all' | 'paid' | 'partial' | 'unpaid'

export default function HistoryPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [salleFilter, setSalleFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  function loadData() {
    setLoading(true)
    Promise.all([getReservations(), getSalles()])
      .then(([res, sal]) => {
        setReservations(res)
        setSalles(sal)
      })
      .catch((e) => {
        addToast('error', e instanceof Error ? e.message : 'Erreur de chargement')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    let result = [...reservations]

    // Sort by date desc (most recent first)
    result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    // Search by client name
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.user.name.toLowerCase().includes(q) || r.salle.label.toLowerCase().includes(q))
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter((r) => getPaymentStatus(r.paidAmount, r.totalAmount) === paymentFilter)
    }

    // Salle filter
    if (salleFilter) {
      result = result.filter((r) => r.salleId === salleFilter)
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00')
      result = result.filter((r) => new Date(r.startTime) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59')
      result = result.filter((r) => new Date(r.startTime) <= to)
    }

    return result
  }, [reservations, search, statusFilter, paymentFilter, salleFilter, dateFrom, dateTo])

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  const PAYMENT_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
    paid: 'success',
    partial: 'warning',
    unpaid: 'danger',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Historique</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} r&eacute;servation{filtered.length > 1 ? 's' : ''} trouv&eacute;e{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 mb-6 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Row 1: Search + Date range */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">Recherche</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom du client ou salle..."
              className="w-full px-3 py-2 text-sm text-white rounded-lg outline-none transition-all"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm text-white rounded-lg outline-none cursor-pointer"
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm text-white rounded-lg outline-none cursor-pointer"
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Row 2: Status + Payment + Salle filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <span className="text-xs text-slate-500 mr-1">Statut :</span>
          {([['all', 'Tous'], ['CONFIRMED', 'Confirm\u00e9es'], ['CANCELLED', 'Annul\u00e9es']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                statusFilter === value ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              style={
                statusFilter === value
                  ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {label}
            </button>
          ))}

          <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Payment filter */}
          <span className="text-xs text-slate-500 mr-1">Paiement :</span>
          {([['all', 'Tous'], ['paid', 'Pay\u00e9'], ['partial', 'Partiel'], ['unpaid', 'Non pay\u00e9']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPaymentFilter(value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                paymentFilter === value ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              style={
                paymentFilter === value
                  ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {label}
            </button>
          ))}

          <span className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Salle filter */}
          <select
            value={salleFilter}
            onChange={(e) => setSalleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs text-slate-400 rounded-md outline-none cursor-pointer"
            style={inputStyle}
          >
            <option value="" style={{ background: '#0f172a' }}>Toutes les salles</option>
            {salles.map((s) => (
              <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>{s.label}</option>
            ))}
          </select>

          {/* Reset */}
          {(search || statusFilter !== 'all' || paymentFilter !== 'all' || salleFilter || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setPaymentFilter('all')
                setSalleFilter('')
                setDateFrom('')
                setDateTo('')
              }}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-white rounded-md transition-colors cursor-pointer ml-auto"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              R&eacute;initialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-6 h-6" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm text-slate-500">Aucune r&eacute;servation trouv&eacute;e</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Horaire</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pay&eacute;</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const payStatus = getPaymentStatus(r.paidAmount, r.totalAmount)
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReservation(r)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                        background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                    >
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(r.startTime)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{r.salle.label}</span>
                          {r.salle.type === 'STUDIO' && <Badge variant="studio">Studio</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatTime(r.startTime)} - {formatTime(r.endTime)}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.user.name}</td>
                      <td className="px-4 py-3 text-white text-right whitespace-nowrap font-medium">{formatPrice(r.totalAmount)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={payStatus === 'paid' ? 'text-emerald-400' : payStatus === 'partial' ? 'text-amber-400' : 'text-slate-500'}>
                          {formatPrice(r.paidAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {r.status === 'CANCELLED'
                          ? <Badge variant="danger">Annul&eacute;e</Badge>
                          : <Badge variant={PAYMENT_BADGE[payStatus]}>{getPaymentStatusLabel(payStatus)}</Badge>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
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
