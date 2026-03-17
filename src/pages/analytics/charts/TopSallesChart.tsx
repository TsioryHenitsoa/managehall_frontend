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
import type { TopSalle } from '../../../types/analytics.types.ts'
import { formatPrice } from '../../../utils/format.ts'

interface Props {
  data: TopSalle[]
}

export default function TopSallesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-5 flex items-center justify-center h-[200px]"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-sm text-slate-500">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <h3 className="text-sm font-semibold text-white mb-4">Top salles</h3>

      {/* Table view for detailed data */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">#</th>
              <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">Salle</th>
              <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">Bâtiment</th>
              <th className="text-right text-xs text-slate-500 font-medium pb-2 pr-4">Réservations</th>
              <th className="text-right text-xs text-slate-500 font-medium pb-2 pr-4">Facturé</th>
              <th className="text-right text-xs text-slate-500 font-medium pb-2">Encaissé</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.salleId} style={i < data.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.04)' } : {}}>
                <td className="py-2.5 pr-4 text-slate-600 text-xs">{i + 1}</td>
                <td className="py-2.5 pr-4 text-white font-medium">{s.salleLabel}</td>
                <td className="py-2.5 pr-4 text-slate-400">{s.building || '—'}</td>
                <td className="py-2.5 pr-4 text-right text-slate-300">{s.reservations}</td>
                <td className="py-2.5 pr-4 text-right text-slate-400">{formatPrice(s.bookedAmount)}</td>
                <td className="py-2.5 text-right text-emerald-400 font-medium">{formatPrice(s.paidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <div style={{ height: Math.max(120, data.length * 32 + 20) }}>
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
              dataKey="salleLabel"
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
              formatter={(value) => [`${Number(value)} réservation${Number(value) > 1 ? 's' : ''}`, '']}
            />
            <Bar dataKey="reservations" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#6366f1' : index === 1 ? '#818cf8' : '#a5b4fc'}
                  fillOpacity={0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
