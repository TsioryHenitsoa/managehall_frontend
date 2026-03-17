import type { Reservation } from '../../types/reservation.types'
import { formatTime } from '../../utils/date'
import { useAuthStore } from '../../stores/auth.store'

interface Props {
  reservation: Reservation
  hourStart: number
  onClick: (reservation: Reservation) => void
}

export default function ReservationBlock({ reservation, hourStart, onClick }: Props) {
  const user = useAuthStore((s) => s.user)

  const start = new Date(reservation.startTime)
  const end = new Date(reservation.endTime)

  const startHour = start.getHours() + start.getMinutes() / 60
  const endHour = end.getHours() + end.getMinutes() / 60
  const top = (startHour - hourStart) * 3
  const height = (endHour - startHour) * 3

  const isMine = user?.id === reservation.userId
  const isCancelled = reservation.status === 'CANCELLED'

  const colors = isCancelled
    ? { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' }
    : isMine
    ? { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' }
    : { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' }

  return (
    <button
      onClick={() => onClick(reservation)}
      className="absolute left-1 right-1 rounded-md px-1.5 py-0.5 text-left overflow-hidden cursor-pointer transition-opacity hover:opacity-80"
      style={{
        top: `${top}rem`,
        height: `${height}rem`,
        minHeight: '1.5rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
      title={`${reservation.salle.label} — ${reservation.user.name}`}
    >
      <p className="text-[10px] font-semibold truncate">{reservation.salle.label}</p>
      {height >= 2.5 && (
        <p className="text-[10px] truncate opacity-75">
          {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
        </p>
      )}
      {height >= 4 && (
        <p className="text-[10px] truncate opacity-60">{reservation.user.name}</p>
      )}
    </button>
  )
}
