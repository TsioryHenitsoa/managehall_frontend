import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { getSalles, getAvailableSalles } from '../../services/salle.service'
import { createReservation } from '../../services/reservation.service'
import { useToastStore } from '../../stores/toast.store.ts'
import type { Salle } from '../../types/salle.types'
import type { Reservation } from '../../types/reservation.types'
import { formatPrice } from '../../utils/format'
import { formatDateISO, setTimeOnDate } from '../../utils/date'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (reservation: Reservation) => void
  prefill?: { date?: Date; hour?: number; salleId?: string }
}

const TIME_SLOTS = Array.from({ length: 33 }, (_, i) => 6 + i * 0.5) // 6, 6.5, 7, ..., 22

function formatSlot(slot: number): string {
  const h = Math.floor(slot)
  const m = slot % 1 !== 0 ? '30' : '00'
  return `${h}h${m}`
}

export default function NewReservationModal({ open, onClose, onCreated, prefill }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const [salles, setSalles] = useState<Salle[]>([])
  const [salleId, setSalleId] = useState('')
  const [date, setDate] = useState(formatDateISO(new Date()))
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(9)
  const [note, setNote] = useState('')
  const [minCapacity, setMinCapacity] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [availableSalles, setAvailableSalles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getSalles().then(setSalles).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open || !prefill) return
    if (prefill.date) setDate(formatDateISO(prefill.date))
    if (prefill.hour !== undefined) {
      setStartHour(prefill.hour)
      setEndHour(Math.min(prefill.hour + 1, 22))
    }
    if (prefill.salleId) setSalleId(prefill.salleId)
  }, [open, prefill])

  useEffect(() => {
    if (!open || !date || endHour <= startHour) return

    setCheckingAvail(true)
    const start = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(startHour), (startHour % 1) * 60)
    const end = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(endHour), (endHour % 1) * 60)

    getAvailableSalles(start.toISOString(), end.toISOString())
      .then((available) => setAvailableSalles(available.map((s) => s.id)))
      .catch(() => setAvailableSalles([]))
      .finally(() => setCheckingAvail(false))
  }, [open, date, startHour, endHour])

  const capacityFilter = minCapacity ? Number(minCapacity) : 0
  const filteredSalles = salles.filter((s) => s.type === 'STUDIO' || s.capacity >= capacityFilter)
  const selectedSalle = salles.find((s) => s.id === salleId)
  const durationHours = endHour - startHour
  const estimatedPrice = selectedSalle ? selectedSalle.pricePerHour * durationHours : 0
  const isAvailable = salleId ? availableSalles.includes(salleId) : true

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!salleId || endHour <= startHour) return

    setLoading(true)
    setError(null)

    const startTime = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(startHour), (startHour % 1) * 60)
    const endTime = setTimeOnDate(new Date(date + 'T00:00:00'), Math.floor(endHour), (endHour % 1) * 60)

    try {
      const reservation = await createReservation({
        salleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        note: note || undefined,
      })
      addToast('success', 'Réservation créée avec succès')
      onCreated(reservation)
      resetForm()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de la création'
      setError(msg)
      addToast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setSalleId('')
    setDate(formatDateISO(new Date()))
    setStartHour(8)
    setEndHour(9)
    setNote('')
    setMinCapacity('')
    setError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
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
    <Modal open={open} onClose={handleClose} title="Nouvelle réservation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Capacity filter + Salle selection */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre de personnes</label>
          <input
            type="number"
            value={minCapacity}
            onChange={(e) => {
              setMinCapacity(e.target.value)
              // Reset salle if current selection no longer fits
              if (e.target.value && selectedSalle && selectedSalle.capacity < Number(e.target.value)) {
                setSalleId('')
              }
            }}
            placeholder="Ex: 30"
            min={1}
            className={inputClass}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">
            Salle
            {capacityFilter > 0 && (
              <span className="ml-1.5 text-xs text-slate-600">
                ({filteredSalles.length} salle{filteredSalles.length > 1 ? 's' : ''} &ge; {capacityFilter} places)
              </span>
            )}
          </label>
          <select
            value={salleId}
            onChange={(e) => setSalleId(e.target.value)}
            required
            className={`${inputClass} cursor-pointer`}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="" style={{ background: '#0f172a' }}>Sélectionner une salle</option>
            {filteredSalles.map((s) => {
              const available = availableSalles.includes(s.id)
              return (
                <option key={s.id} value={s.id} disabled={!available && !checkingAvail} style={{ background: '#0f172a' }}>
                  {s.label} — {s.capacity} pl. — {formatPrice(s.pricePerHour)}/h {s.type === 'STUDIO' ? '(Studio)' : ''} {!available && !checkingAvail ? '(indisponible)' : ''}
                </option>
              )
            })}
          </select>
          {salleId && !isAvailable && !checkingAvail && (
            <p className="text-xs text-red-400 mt-1">Cette salle est occupée sur ce créneau.</p>
          )}
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

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Note (optionnel)</label>
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

        {/* Price estimate */}
        {selectedSalle && durationHours > 0 && (
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="text-sm text-slate-400">
              <span className="font-medium text-white">{durationHours % 1 !== 0 ? `${Math.floor(durationHours)}h30` : `${durationHours}h`}</span> × {formatPrice(selectedSalle.pricePerHour)}
            </div>
            <div className="flex items-center gap-2">
              {selectedSalle.type === 'STUDIO' && <Badge variant="studio">Studio</Badge>}
              <span className="text-sm font-semibold text-white">{formatPrice(estimatedPrice)}</span>
            </div>
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
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-400 rounded-lg transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !salleId || !isAvailable || endHour <= startHour}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}
          >
            {loading && <Spinner className="w-4 h-4" />}
            Confirmer
          </button>
        </div>
      </form>
    </Modal>
  )
}
