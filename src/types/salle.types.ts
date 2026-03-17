export type SalleType = 'SALLE' | 'STUDIO'

export interface Salle {
  id: string
  label: string
  description: string | null
  capacity: number
  pricePerHour: number
  building: string
  type: SalleType
  isActive: boolean
  createdAt: string
}

export interface CreateSalleBody {
  label: string
  description?: string
  capacity: number
  pricePerHour: number
  building?: string
  type?: SalleType
}

export interface UpdateSalleBody {
  label?: string
  description?: string
  capacity?: number
  pricePerHour?: number
  building?: string
  type?: SalleType
}

export interface AvailabilityResponse {
  date: string
  salleId: string
  reservations: { start: string; end: string }[]
}
