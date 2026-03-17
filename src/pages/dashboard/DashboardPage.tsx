import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { getReservations } from '../../services/reservation.service'
import { getSalles } from '../../services/salle.service'
import type { Reservation } from '../../types/reservation.types'
import type { Salle } from '../../types/salle.types'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatPrice, getPaymentStatus, getPaymentStatusLabel } from '../../utils/format'
import { formatDate, formatTime } from '../../utils/date'

const RevenueChart = lazy(() => import('../../components/charts/RevenueChart.tsx'))
const SalleUsageChart = lazy(() => import('../../components/charts/SalleUsageChart.tsx'))
const PaymentStatusChart = lazy(() => import('../../components/charts/PaymentStatusChart.tsx'))
const PeakHoursChart = lazy(() => import('../../components/charts/PeakHoursChart.tsx'))

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getReservations(), getSalles()])
      .then(([r, s]) => { setReservations(r); setSalles(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const todayReservations = reservations.filter((r) => {
    const start = new Date(r.startTime)
    return r.status === 'CONFIRMED' && start >= todayStart && start < todayEnd
  })

  const upcoming = reservations
    .filter((r) => r.status === 'CONFIRMED' && new Date(r.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  const todayRevenue = todayReservations.reduce((sum, r) => sum + r.paidAmount, 0)

  const PAYMENT_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
    paid: 'success',
    partial: 'warning',
    unpaid: 'danger',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Bonjour, {user?.name?.split(' ')[0] ?? 'utilisateur'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(now)} — Vue d&apos;ensemble
          </p>
        </div>
        <button
          onClick={() => navigate('/reservations')}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Réservations aujourd'hui"
          value={String(todayReservations.length)}
          color="#6366f1"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatCard
          label="Salles actives"
          value={String(salles.length)}
          color="#8b5cf6"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          }
        />
        <StatCard
          label="Revenus du jour"
          value={formatPrice(todayRevenue)}
          color="#10b981"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts - Revenue trend */}
      <Suspense fallback={<div className="h-[300px] flex items-center justify-center"><Spinner className="w-5 h-5" /></div>}>
      <div className="mb-6">
        <RevenueChart reservations={reservations} />
      </div>

      {/* Charts - Salle usage + Payment status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SalleUsageChart reservations={reservations} />
        <PaymentStatusChart reservations={reservations} />
      </div>

      {/* Charts - Peak hours */}
      <div className="mb-6">
        <PeakHoursChart reservations={reservations} />
      </div>
      </Suspense>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming reservations */}
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-semibold text-white">Prochaines réservations</h2>
            <Link to="/reservations" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
              Voir tout
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune réservation à venir</p>
          ) : (
            <div>
              {upcoming.map((r, i) => {
                const payStatus = getPaymentStatus(r.paidAmount, r.totalAmount)
                return (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between" style={i < upcoming.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{r.salle.label}</span>
                        {r.salle.type === 'STUDIO' && <Badge variant="studio">Studio</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(r.startTime)} · {formatTime(r.startTime)} - {formatTime(r.endTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PAYMENT_BADGE[payStatus]}>{getPaymentStatusLabel(payStatus)}</Badge>
                      <span className="text-sm font-medium text-slate-300">{formatPrice(r.totalAmount)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Salles overview */}
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-semibold text-white">Salles</h2>
            <Link to="/salles" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
              Voir tout
            </Link>
          </div>
          <div>
            {salles.map((s, i) => (
              <Link
                key={s.id}
                to={`/salles/${s.id}`}
                className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors block cursor-pointer"
                style={i < salles.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{s.label}</span>
                  <Badge variant={s.type === 'STUDIO' ? 'studio' : 'info'}>
                    {s.type === 'STUDIO' ? 'Studio' : 'Salle'}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{formatPrice(s.pricePerHour)}/h</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <span style={{ color, opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
