import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { cancelReservation } from '../../services/reservation.service'
import { getPayments, addPayment } from '../../services/payment.service'
import { useToastStore } from '../../stores/toast.store.ts'
import type { Reservation, PaymentSummary } from '../../types/reservation.types'
import { formatPrice, formatDuration, getPaymentStatus, getPaymentStatusLabel } from '../../utils/format'
import { formatDateFull, formatTime } from '../../utils/date'
import EditReservationModal from './EditReservationModal.tsx'

interface Props {
  reservation: Reservation | null
  onClose: () => void
  onUpdated: () => void
}

const PAYMENT_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
}

export default function ReservationDetailModal({ reservation, onClose, onUpdated }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payLoading, setPayLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!reservation) return
    getPayments(reservation.id)
      .then(setPaymentSummary)
      .catch(() => {})
  }, [reservation])

  if (!reservation) return null

  if (editing) {
    return (
      <EditReservationModal
        reservation={reservation}
        onClose={() => setEditing(false)}
        onUpdated={() => {
          setEditing(false)
          onUpdated()
        }}
      />
    )
  }

  const status = getPaymentStatus(
    paymentSummary?.paidAmount ?? reservation.paidAmount,
    paymentSummary?.totalAmount ?? reservation.totalAmount
  )
  const remaining = paymentSummary?.remainingAmount ?? (reservation.totalAmount - reservation.paidAmount)
  const paidPercent = reservation.totalAmount > 0
    ? Math.min(100, ((paymentSummary?.paidAmount ?? reservation.paidAmount) / reservation.totalAmount) * 100)
    : 0

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return

    setPayLoading(true)
    setError(null)
    try {
      await addPayment(reservation!.id, { amount, method: payMethod })
      const updated = await getPayments(reservation!.id)
      setPaymentSummary(updated)
      setPayAmount('')
      addToast('success', `Paiement de ${formatPrice(amount)} enregistré`)
      onUpdated()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur de paiement'
      setError(msg)
      addToast('error', msg)
    } finally {
      setPayLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setCancelLoading(true)
    try {
      await cancelReservation(reservation!.id)
      addToast('success', 'Réservation annulée')
      onUpdated()
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'annulation"
      setError(msg)
      addToast('error', msg)
    } finally {
      setCancelLoading(false)
      setConfirmCancel(false)
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

  return (
    <Modal open onClose={onClose} title="Détail de la réservation" wide>
      <div className="space-y-5">
        {/* Info section */}
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Salle" value={
            <div className="flex items-center gap-2">
              <span>{reservation.salle.label}</span>
              {reservation.salle.type === 'STUDIO' && <Badge variant="studio">Studio</Badge>}
            </div>
          } />
          <InfoRow label="Date" value={formatDateFull(reservation.startTime)} />
          <InfoRow label="Horaire" value={`${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}`} />
          <InfoRow label="Durée" value={formatDuration(reservation.startTime, reservation.endTime)} />
          <InfoRow label="Tarif appliqué" value={`${formatPrice(reservation.pricePerHourSnapshot)}/h`} />
          {reservation.status === 'CANCELLED' && (
            <InfoRow label="Statut" value={<Badge variant="danger">Annulée</Badge>} />
          )}
          {reservation.note && <InfoRow label="Note" value={reservation.note} />}
          <InfoRow label="Réservé par" value={reservation.user.name} />
        </div>

        {/* Payment section */}
        {reservation.status !== 'CANCELLED' && (
          <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Paiement</h3>
              <Badge variant={PAYMENT_BADGE[status]}>
                {getPaymentStatusLabel(status)}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{formatPrice(paymentSummary?.paidAmount ?? reservation.paidAmount)} payé</span>
                <span>{formatPrice(reservation.totalAmount)} total</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${paidPercent}%`,
                    background: status === 'paid'
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : status === 'partial'
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              {remaining > 0 && (
                <p className="text-xs text-slate-500 mt-1">Reste à payer : {formatPrice(remaining)}</p>
              )}
            </div>

            {/* Payments list */}
            {paymentSummary && paymentSummary.payments.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {paymentSummary.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-300">{formatPrice(p.amount)}</span>
                      <Badge variant="neutral">{p.method}</Badge>
                    </div>
                    <span className="text-xs text-slate-600">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add payment form */}
            {remaining > 0 && (
              <form onSubmit={handleAddPayment} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Montant</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`Max ${formatPrice(remaining)}`}
                    max={remaining}
                    min={1}
                    step="any"
                    required
                    className="w-full px-3 py-2 text-sm text-white rounded-lg outline-none transition-all"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Méthode</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="px-3 py-2 text-sm text-white rounded-lg outline-none transition-all cursor-pointer"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="CASH" style={{ background: '#0f172a' }}>Cash</option>
                    <option value="MVOLA" style={{ background: '#0f172a' }}>MVola</option>
                    <option value="ORANGE" style={{ background: '#0f172a' }}>Orange</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-3 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 0 15px rgba(16,185,129,0.2)',
                  }}
                >
                  {payLoading && <Spinner className="w-3.5 h-3.5" />}
                  Payer
                </button>
              </form>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg px-3 py-2 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        {reservation.status !== 'CANCELLED' && (
          <div className="flex justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              style={
                confirmCancel
                  ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                  : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }
              }
              onMouseEnter={(e) => { if (!confirmCancel) e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
              onMouseLeave={(e) => { if (!confirmCancel) e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            >
              {cancelLoading && <Spinner className="w-3.5 h-3.5" />}
              {confirmCancel ? "Confirmer l'annulation" : 'Annuler'}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm font-medium text-indigo-400 rounded-lg transition-all cursor-pointer"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)' }}
              >
                Modifier
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 rounded-lg transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm text-white">{value}</div>
    </div>
  )
}
