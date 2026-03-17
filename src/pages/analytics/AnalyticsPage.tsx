import { useEffect, useState, lazy, Suspense } from 'react'
import Spinner from '../../components/ui/Spinner.tsx'
import { useToastStore } from '../../stores/toast.store.ts'
import { formatPrice } from '../../utils/format.ts'
import {
  getOverview,
  getReservationSeries,
  getRevenueSeries,
  getTopSalles,
  getPaymentMethods,
} from '../../services/analytics.service.ts'
import type {
  AnalyticsOverview,
  TimeSeriesPoint,
  Granularity,
  TopSalle,
  PaymentMethodBreakdown,
} from '../../types/analytics.types.ts'

const RevenueSeriesChart = lazy(() => import('./charts/RevenueSeriesChart.tsx'))
const ReservationSeriesChart = lazy(() => import('./charts/ReservationSeriesChart.tsx'))
const TopSallesChart = lazy(() => import('./charts/TopSallesChart.tsx'))
const PaymentMethodsChart = lazy(() => import('./charts/PaymentMethodsChart.tsx'))

type RangePreset = '7d' | '30d' | '90d' | '12m' | 'custom'

function getDateRange(preset: RangePreset): { from: string; to: string } {
  const to = new Date()
  to.setDate(to.getDate() + 1) // inclure aujourd'hui (borne exclusive)
  const from = new Date()
  switch (preset) {
    case '7d': from.setDate(from.getDate() - 6); break
    case '30d': from.setDate(from.getDate() - 29); break
    case '90d': from.setDate(from.getDate() - 89); break
    case '12m': from.setFullYear(from.getFullYear() - 1); break
    default: from.setDate(from.getDate() - 29)
  }
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

function granularityForPreset(preset: RangePreset): Granularity {
  switch (preset) {
    case '7d': return 'day'
    case '30d': return 'day'
    case '90d': return 'week'
    case '12m': return 'month'
    default: return 'day'
  }
}

export default function AnalyticsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [loading, setLoading] = useState(true)

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [revenueSeries, setRevenueSeries] = useState<TimeSeriesPoint[]>([])
  const [reservationSeries, setReservationSeries] = useState<TimeSeriesPoint[]>([])
  const [topSalles, setTopSalles] = useState<TopSalle[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdown[]>([])

  function loadData() {
    setLoading(true)
    const range = preset === 'custom'
      ? { from: customFrom, to: customTo }
      : getDateRange(preset)
    const gran = preset === 'custom' ? 'day' : granularityForPreset(preset)

    Promise.all([
      getOverview(range.from, range.to),
      getRevenueSeries(gran, range.from, range.to),
      getReservationSeries(gran, range.from, range.to),
      getTopSalles(10, range.from, range.to),
      getPaymentMethods(range.from, range.to),
    ])
      .then(([ov, rev, res, top, pay]) => {
        setOverview(ov)
        setRevenueSeries(rev)
        setReservationSeries(res)
        setTopSalles(top)
        setPaymentMethods(pay)
      })
      .catch((e) => {
        addToast('error', e instanceof Error ? e.message : 'Erreur de chargement des analytics')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (preset !== 'custom') loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const PRESETS: { value: RangePreset; label: string }[] = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '12m', label: '12 mois' },
    { value: 'custom', label: 'Personnalisé' },
  ]

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analyse des revenus et des réservations</p>
        </div>
      </div>

      {/* Date range filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PRESETS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPreset(value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
              preset === value ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            style={
              preset === value
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

        {preset === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 text-sm text-white rounded-lg outline-none cursor-pointer"
              style={inputStyle}
            />
            <span className="text-slate-600">—</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 text-sm text-white rounded-lg outline-none cursor-pointer"
              style={inputStyle}
            />
            <button
              onClick={loadData}
              disabled={!customFrom || !customTo}
              className="px-3 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-40 cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 0 15px rgba(99,102,241,0.2)',
              }}
            >
              Appliquer
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="w-6 h-6" />
        </div>
      ) : (
        <>
          {/* Overview cards */}
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <OverviewCard
                label="Réservations"
                value={String(overview.reservations.total)}
                sub={`${overview.reservations.cancelled} annulée${overview.reservations.cancelled > 1 ? 's' : ''}`}
                color="#6366f1"
              />
              <OverviewCard
                label="Revenus encaissés"
                value={formatPrice(overview.finance.paidAmount)}
                sub={`sur ${formatPrice(overview.finance.bookedAmount)} facturé`}
                color="#10b981"
              />
              <OverviewCard
                label="Reste à payer"
                value={formatPrice(overview.finance.remainingAmount)}
                sub={`Moy. ${formatPrice(overview.finance.averageRevenuePerReservation)}/rés.`}
                color="#f59e0b"
              />
              <OverviewCard
                label="Clients uniques"
                value={String(overview.activity.uniqueCustomers)}
                sub={`${overview.activity.activeSalles} salle${overview.activity.activeSalles > 1 ? 's' : ''} active${overview.activity.activeSalles > 1 ? 's' : ''}`}
                color="#8b5cf6"
              />
            </div>
          )}

          {/* Charts */}
          <Suspense fallback={<div className="h-[300px] flex items-center justify-center"><Spinner className="w-5 h-5" /></div>}>
            {/* Revenue series */}
            <div className="mb-6">
              <RevenueSeriesChart data={revenueSeries} />
            </div>

            {/* Reservation series + Payment methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ReservationSeriesChart data={reservationSeries} />
              <PaymentMethodsChart data={paymentMethods} />
            </div>

            {/* Top salles */}
            <div className="mb-6">
              <TopSallesChart data={topSalles} />
            </div>
          </Suspense>

          {/* Cancellation rate */}
          {overview && overview.reservations.total > 0 && (
            <div
              className="rounded-xl p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-3">Taux d&apos;annulation</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(overview.reservations.cancellationRate, 100)}%`,
                        background: overview.reservations.cancellationRate > 20
                          ? 'linear-gradient(90deg, #ef4444, #f87171)'
                          : overview.reservations.cancellationRate > 10
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #10b981, #34d399)',
                      }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-white min-w-[60px] text-right">
                  {overview.reservations.cancellationRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {overview.reservations.cancelled} annulée{overview.reservations.cancelled > 1 ? 's' : ''} sur {overview.reservations.total} réservation{overview.reservations.total > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function OverviewCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: color, opacity: 0.7 }} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
    </div>
  )
}
