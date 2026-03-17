import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Reservation } from '../../types/reservation.types.ts'

interface Props {
  reservations: Reservation[]
}

export default function RevenueChart({ reservations }: Props) {
  const data = useMemo(() => {
    const days: { label: string; date: string; revenus: number; total: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })

      const dayReservations = reservations.filter((r) => {
        const rDate = new Date(r.startTime).toISOString().split('T')[0]
        return rDate === dateStr && r.status === 'CONFIRMED'
      })

      const revenus = dayReservations.reduce((sum, r) => sum + r.paidAmount, 0)
      const total = dayReservations.reduce((sum, r) => sum + r.totalAmount, 0)

      days.push({ label: dayLabel, date: dateStr, revenus, total })
    }

    return days
  }, [reservations])

  const formatMGA = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
    return String(value)
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 className="text-sm font-semibold text-white mb-4">Revenus — 7 derniers jours</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMGA}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}
              itemStyle={{ color: '#e2e8f0', fontSize: 12, padding: 0 }}
              formatter={(value, name) => [
                `${Number(value).toLocaleString('fr-FR')} MGA`,
                name === 'revenus' ? 'Payé' : 'Total facturé',
              ]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              fill="url(#totalGrad)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="revenus"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenuGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full bg-indigo-500" />
          Revenus (payé)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full bg-violet-500 opacity-60" style={{ borderTop: '1px dashed #8b5cf6' }} />
          Total facturé
        </span>
      </div>
    </div>
  )
}
