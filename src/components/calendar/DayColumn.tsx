import type { Reservation } from '../../types/reservation.types'
import { formatDate, isToday, isSameDay } from '../../utils/date'
import ReservationBlock from './ReservationBlock'

interface Props {
  date: Date
  reservations: Reservation[]
  hourStart: number
  hourEnd: number
  onSlotClick: (date: Date, hour: number) => void
  onReservationClick: (reservation: Reservation) => void
}

export default function DayColumn({
  date,
  reservations,
  hourStart,
  hourEnd,
  onSlotClick,
  onReservationClick,
}: Props) {
  const today = isToday(date)
  const slots = Array.from({ length: (hourEnd - hourStart) * 2 }, (_, i) => hourStart + i * 0.5)

  const dayReservations = reservations.filter((r) => {
    const rDate = new Date(r.startTime)
    return isSameDay(rDate, date)
  })

  return (
    <div
      className="flex-1 min-w-[100px] last:border-r-0"
      style={{
        borderRight: '1px solid rgba(255,255,255,0.04)',
        background: today ? 'rgba(99,102,241,0.03)' : 'transparent',
      }}
    >
      {/* Day header */}
      <div
        className="sticky top-0 z-10 px-2 py-2 text-center"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: today ? 'rgba(99,102,241,0.06)' : 'rgba(10,17,40,0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className={`text-xs font-medium ${today ? 'text-indigo-400' : 'text-slate-500'}`}>
          {formatDate(date)}
        </p>
        {today && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
      </div>

      {/* Hours */}
      <div className="relative">
        {slots.map((slot) => {
          const isHalf = slot % 1 !== 0
          return (
            <div
              key={slot}
              className="h-6 cursor-pointer transition-colors"
              style={{ borderBottom: `1px solid rgba(255,255,255,${isHalf ? '0.02' : '0.05'})` }}
              onClick={() => onSlotClick(date, slot)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            />
          )
        })}

        {/* Reservation overlays */}
        {dayReservations.map((r) => (
          <ReservationBlock
            key={r.id}
            reservation={r}
            hourStart={hourStart}
            onClick={onReservationClick}
          />
        ))}
      </div>
    </div>
  )
}
