import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { Reservation } from '../../types/reservation.types.ts'
import { getPaymentStatus } from '../../utils/format.ts'

interface Props {
  reservations: Reservation[]
}

const COLORS: Record<string, { fill: string; label: string }> = {
  paid: { fill: '#10b981', label: 'Payé' },
  partial: { fill: '#f59e0b', label: 'Partiel' },
  unpaid: { fill: '#ef4444', label: 'Non payé' },
}

export default function PaymentStatusChart({ reservations }: Props) {
  const { data, total } = useMemo(() => {
    const counts = { paid: 0, partial: 0, unpaid: 0 }

    const confirmed = reservations.filter((r) => r.status === 'CONFIRMED')
    confirmed.forEach((r) => {
      const status = getPaymentStatus(r.paidAmount, r.totalAmount)
      counts[status]++
    })

    const chartData = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: COLORS[key].label,
        value,
        fill: COLORS[key].fill,
      }))

    return { data: chartData, total: confirmed.length }
  }, [reservations])

  if (total === 0) {
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
      <h3 className="text-sm font-semibold text-white mb-2">Statut des paiements</h3>
      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill, opacity: 0.8 }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  )
}
