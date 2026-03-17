import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { PaymentMethodBreakdown } from '../../../types/analytics.types.ts'
import { formatPrice } from '../../../utils/format.ts'

interface Props {
  data: PaymentMethodBreakdown[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  MVOLA: 'MVola',
  ORANGE: 'Orange Money',
  CARD: 'Carte',
}

export default function PaymentMethodsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center h-full min-h-[280px]"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-sm text-slate-500">Aucun paiement enregistré</p>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-2">Méthodes de paiement</h3>
      <div className="h-[180px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="amount"
              nameKey="method"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.75} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{formatPrice(total)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        {data.map((d, i) => (
          <div key={d.method} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length], opacity: 0.75 }} />
              <span className="text-slate-300">{METHOD_LABELS[d.method] ?? d.method}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">{d.count} paiement{d.count > 1 ? 's' : ''}</span>
              <span className="text-white font-medium">{d.percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
