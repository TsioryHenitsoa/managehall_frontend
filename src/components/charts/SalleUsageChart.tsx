import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Reservation } from '../../types/reservation.types.ts'

interface Props {
  reservations: Reservation[]
}

export default function SalleUsageChart({ reservations }: Props) {
  const data = useMemo(() => {
    const countMap = new Map<string, { label: string; count: number; type: string }>()

    reservations
      .filter((r) => r.status === 'CONFIRMED')
      .forEach((r) => {
        const key = r.salle.label
        const existing = countMap.get(key)
        if (existing) {
          existing.count++
        } else {
          countMap.set(key, { label: key, count: 1, type: r.salle.type })
        }
      })

    return Array.from(countMap.values()).sort((a, b) => b.count - a.count)
  }, [reservations])

  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center h-full"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-sm text-slate-500">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 className="text-sm font-semibold text-white mb-4">Réservations par salle</h3>
      <div style={{ height: Math.max(160, data.length * 40 + 20) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={100}
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
              formatter={(value) => [`${Number(value)} réservation${Number(value) > 1 ? 's' : ''}`, '']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === 'STUDIO' ? '#8b5cf6' : '#6366f1'}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(99,102,241,0.5)' }} />
          Salle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(139,92,246,0.5)' }} />
          Studio
        </span>
      </div>
    </div>
  )
}
