import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import { getAvailableSalles } from '../../services/salle.service.ts'
import { updateReservation } from '../../services/reservation.service.ts'
import { useToastStore } from '../../stores/toast.store.ts'
import { useAuthStore } from '../../stores/auth.store.ts'
import type { Reservation } from '../../types/reservation.types.ts'
import { formatPrice } from '../../utils/format.ts'
import { formatDateISO, setTimeOnDate } from '../../utils/date.ts'

interface Props {
  reservation: Reservation
  onClose: () => void
  onUpdated: () => void
}

const TIME_SLOTS = Array.from({ length: 33 }, (_, i) => 6 + i * 0.5)

function formatSlot(slot: number): string {
  const h = Math.floor(slot)
  const m = slot % 1 !== 0 ? '30' : '00'
  return `${h}h${m}`
}

function timeToSlot(dateStr: string): number {
  const d = new Date(dateStr)
  return d.getHours() + d.getMinutes() / 60
}

export default function EditReservationModal({ reservation, onClose, onUpdated }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const [date, setDate] = useState(formatDateISO(new Date(reservation.startTime)))
  const [startHour, setStartHour] = useState(timeToSlot(reservation.startTime))
  const [endHour, setEndHour] = useState(timeToSlot(reservation.endTime))
  const [note, setNote] = useState(reservation.note ?? '')
  const [customPrice, setCustomPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [conflict, setConflict] = useState(false)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check availability when date/time changes
  useEffect(() => {
    if (endHour <= startHour) return

    setCheckingAvail(true)
    const start = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(startHour), (startHour % 1) * 60)
    const end = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(endHour), (endHour % 1) * 60)

    getAvailableSalles(start.toISOString(), end.toISOString())
      .then((available) => {
        const salleIds = available.map((s) => s.id)
        // The salle is available if it's in the list, OR if the only conflict is this reservation itself
        // We can't know that from getAvailableSalles, so we rely on the backend's excludeId logic
        // For UI hint we check if salle appears available
        setConflict(!salleIds.includes(reservation.salleId))
      })
      .catch(() => setConflict(false))
      .finally(() => setCheckingAvail(false))
  }, [date, startHour, endHour, reservation.salleId])

  const durationHours = endHour - startHour
  const pricePerHour = customPrice ? Number(customPrice) : reservation.pricePerHourSnapshot
  const estimatedTotal = durationHours > 0 ? pricePerHour * durationHours : 0

  const hasChanges = date !== formatDateISO(new Date(reservation.startTime)) ||
    startHour !== timeToSlot(reservation.startTime) ||
    endHour !== timeToSlot(reservation.endTime) ||
    note !== (reservation.note ?? '') ||
    (customPrice !== '' && Number(customPrice) !== reservation.pricePerHourSnapshot)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (endHour <= startHour || !hasChanges) return

    setLoading(true)
    setError(null)

    const startTime = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(startHour), (startHour % 1) * 60)
    const endTime = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(endHour), (endHour % 1) * 60)

    try {
      await updateReservation(reservation.id, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        note: note || undefined,
        customPricePerHour: customPrice ? Number(customPrice) : undefined,
      })
      addToast('success', 'Réservation modifiée avec succès')
      onUpdated()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de la modification'
      setError(msg)
      addToast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
  }

  const inputClass = 'w-full px-3 py-2.5 text-sm text-white rounded-xl outline-none transition-all duration-200'

  return (
    <Modal open onClose={onClose} title="Modifier la réservation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Salle info (read-only) */}
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-500 mb-0.5">Salle</p>
          <p className="text-sm font-medium text-white">{reservation.salle.label}</p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
            style={{ ...inputStyle, colorScheme: 'dark' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Début</label>
            <select
              value={startHour}
              onChange={(e) => {
                const v = Number(e.target.value)
                setStartHour(v)
                if (endHour <= v) setEndHour(v + 0.5)
              }}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              {TIME_SLOTS.slice(0, -1).map((slot) => (
                <option key={slot} value={slot} style={{ background: '#0f172a' }}>{formatSlot(slot)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Fin</label>
            <select
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className={`${inputClass} cursor-pointer`}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              {TIME_SLOTS.filter((slot) => slot > startHour).map((slot) => (
                <option key={slot} value={slot} style={{ background: '#0f172a' }}>{formatSlot(slot)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conflict warning */}
        {conflict && !checkingAvail && (
          <div className="rounded-lg px-3 py-2 text-sm text-amber-400" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            Attention : il y a peut-être un conflit sur ce créneau. Le serveur vérifiera la disponibilité.
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Répétition groupe X"
            className={inputClass}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {/* Custom price (admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              Prix/h personnalisé <span className="text-xs text-slate-600">(admin)</span>
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder={`${reservation.pricePerHourSnapshot} (actuel)`}
              min={0}
              step="any"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        )}

        {/* Price estimate */}
        {durationHours > 0 && (
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="text-sm text-slate-400">
              <span className="font-medium text-white">{durationHours % 1 !== 0 ? `${Math.floor(durationHours)}h30` : `${durationHours}h`}</span> × {formatPrice(pricePerHour)}/h
            </div>
            <span className="text-sm font-semibold text-white">{formatPrice(estimatedTotal)}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg px-3 py-2 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !hasChanges || endHour <= startHour}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}
          >
            {loading && <Spinner className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  )
}
