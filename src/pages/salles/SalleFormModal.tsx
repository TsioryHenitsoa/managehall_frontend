import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import { createSalle, updateSalle } from '../../services/salle.service.ts'
import { useToastStore } from '../../stores/toast.store.ts'
import type { Salle, SalleType } from '../../types/salle.types.ts'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  salle?: Salle | null
}

export default function SalleFormModal({ open, onClose, onSaved, salle }: Props) {
  const addToast = useToastStore((s) => s.addToast)
  const isEdit = !!salle

  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [pricePerHour, setPricePerHour] = useState(0)
  const [building, setBuilding] = useState('')
  const [type, setType] = useState<SalleType>('SALLE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (salle) {
      setLabel(salle.label)
      setDescription(salle.description ?? '')
      setCapacity(salle.capacity)
      setPricePerHour(salle.pricePerHour)
      setBuilding(salle.building)
      setType(salle.type)
    } else {
      setLabel('')
      setDescription('')
      setCapacity(10)
      setPricePerHour(0)
      setBuilding('')
      setType('SALLE')
    }
    setError(null)
  }, [open, salle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const body = {
        label,
        description: description || undefined,
        capacity,
        pricePerHour,
        building: building || undefined,
        type,
      }
      if (isEdit && salle) {
        await updateSalle(salle.id, body)
        addToast('success', 'Salle modifiée avec succès')
      } else {
        await createSalle(body)
        addToast('success', 'Salle créée avec succès')
      }
      onSaved()
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde'
      setError(msg)
      addToast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 text-sm text-white rounded-xl outline-none transition-all duration-200'
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  }
  const inputFocusStyle = {
    borderColor: 'rgba(99,102,241,0.6)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
    background: 'rgba(255,255,255,0.06)',
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    Object.assign(e.currentTarget.style, inputFocusStyle)
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modifier la salle' : 'Nouvelle salle'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Nom</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Ex: Salle A"
            className={inputClass}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description optionnelle..."
            rows={2}
            className={`${inputClass} resize-none`}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SalleType)}
              className={inputClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <option value="SALLE" style={{ background: '#0f172a' }}>Salle</option>
              <option value="STUDIO" style={{ background: '#0f172a' }}>Studio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Capacite</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              required
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Prix/heure (MGA)</label>
            <input
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(Number(e.target.value))}
              min={0}
              step="any"
              required
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Batiment</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="Ex: Batiment A"
              className={inputClass}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

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
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 20px rgba(99,102,241,0.2)',
            }}
          >
            {loading && <Spinner className="w-4 h-4" />}
            {isEdit ? 'Enregistrer' : 'Creer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
