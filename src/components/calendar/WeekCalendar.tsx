import type { Reservation } from '../../types/reservation.types'
import { getWeekDays, formatDate, addDays } from '../../utils/date'
import DayColumn from './DayColumn'

const HOUR_START = 6
const HOUR_END = 23

interface Props {
  baseDate: Date
  reservations: Reservation[]
  onDateChange: (date: Date) => void
  onSlotClick: (date: Date, hour: number) => void
  onReservationClick: (reservation: Reservation) => void
}

export default function WeekCalendar({
  baseDate,
  reservations,
  onDateChange,
  onSlotClick,
  onReservationClick,
}: Props) {
  const weekDays = getWeekDays(baseDate)
  const slots = Array.from({ length: (HOUR_END - HOUR_START) * 2 }, (_, i) => HOUR_START + i * 0.5)

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => onDateChange(addDays(baseDate, -7))}
          className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">
            {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
          </span>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-2.5 py-1 text-xs font-medium text-indigo-400 rounded-md transition-colors cursor-pointer"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)' }}
          >
            Aujourd&apos;hui
          </button>
        </div>

        <button
          onClick={() => onDateChange(addDays(baseDate, 7))}
          className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex overflow-x-auto">
        {/* Hour labels */}
        <div className="flex-shrink-0 w-14" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-[41px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
          {slots.map((slot) => {
            const isHalf = slot % 1 !== 0
            return (
              <div
                key={slot}
                className={`h-6 flex items-start justify-end pr-2 pt-0.5 ${isHalf ? 'text-[9px] text-slate-700' : 'text-[10px] text-slate-600'}`}
              >
                {isHalf ? `${Math.floor(slot)}h30` : `${slot}h`}
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            reservations={reservations}
            hourStart={HOUR_START}
            hourEnd={HOUR_END}
            onSlotClick={onSlotClick}
            onReservationClick={onReservationClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2.5 text-xs text-slate-500" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }} />
          Mes réservations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)' }} />
          Autres
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }} />
          Annulées
        </span>
      </div>
    </div>
  )
}
