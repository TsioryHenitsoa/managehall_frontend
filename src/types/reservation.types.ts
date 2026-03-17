import type { Salle } from './salle.types'

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED'

export interface ReservationUser {
  id: string
  name: string
  email: string
}

export interface Payment {
  id: string
  reservationId: string
  amount: number
  method: string
  createdAt: string
}

export interface Reservation {
  id: string
  userId: string
  salleId: string
  startTime: string
  endTime: string
  pricePerHourSnapshot: number
  totalAmount: number
  paidAmount: number
  status: ReservationStatus
  note: string | null
  salle: Salle
  user: ReservationUser
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

export interface CreateReservationBody {
  salleId: string
  startTime: string
  endTime: string
  note?: string
  customPricePerHour?: number
}

export interface UpdateReservationBody {
  startTime?: string
  endTime?: string
  note?: string
  customPricePerHour?: number
}

export interface CreatePaymentBody {
  amount: number
  method?: string
}

export interface PaymentSummary {
  reservationId: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  payments: Payment[]
}
