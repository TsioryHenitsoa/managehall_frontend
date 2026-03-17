import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TimeSeriesPoint } from '../../../types/analytics.types.ts'

interface Props {
  data: TimeSeriesPoint[]
}

export default function ReservationSeriesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center h-full min-h-[280px]"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-sm text-slate-500">Aucune donnée de réservations</p>
      </div>
    )
  }

  const formatLabel = (period: string) => {
    if (period.includes('W')) return period
    const d = new Date(period + 'T00:00:00')
    if (isNaN(d.getTime())) return period
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-4">Réservations par période</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="period"
              tickFormatter={formatLabel}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={30}
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
              labelFormatter={(label) => formatLabel(String(label))}
              formatter={(value) => [`${Number(value)} réservation${Number(value) > 1 ? 's' : ''}`, '']}
            />
            <Bar
              dataKey="value"
              fill="#6366f1"
              fillOpacity={0.6}
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
