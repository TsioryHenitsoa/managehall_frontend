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

export default function PeakHoursChart({ reservations }: Props) {
  const data = useMemo(() => {
    const hourCounts = new Map<number, number>()

    // Initialize all hours
    for (let h = 6; h <= 22; h++) {
      hourCounts.set(h, 0)
    }

    reservations
      .filter((r) => r.status === 'CONFIRMED')
      .forEach((r) => {
        const startHour = new Date(r.startTime).getHours()
        const endHour = new Date(r.endTime).getHours() || 24

        for (let h = startHour; h < endHour; h++) {
          if (h >= 6 && h <= 22) {
            hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1)
          }
        }
      })

    return Array.from(hourCounts.entries())
      .sort(([a], [b]) => a - b)
      .map(([hour, count]) => ({
        hour: `${hour}h`,
        count,
      }))
  }, [reservations])

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h3 className="text-sm font-semibold text-white mb-4">Heures les plus demandées</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              interval={0}
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
              itemStyle={{ color: '#e2e8f0', fontSize: 12, padding: 0 }}
              formatter={(value) => [`${Number(value)} réservation${Number(value) > 1 ? 's' : ''}`, 'Occupation']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={16}>
              {data.map((entry, index) => {
                const intensity = maxCount > 0 ? entry.count / maxCount : 0
                const r = Math.round(99 + (139 - 99) * intensity)
                const g = Math.round(102 + (92 - 102) * intensity)
                const b = Math.round(241 + (246 - 241) * intensity)
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`rgb(${r},${g},${b})`}
                    fillOpacity={0.3 + intensity * 0.5}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
