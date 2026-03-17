import { apiRequest } from './api.service'
import type { Payment, CreatePaymentBody, PaymentSummary } from '../types/reservation.types'

export function getPayments(reservationId: string): Promise<PaymentSummary> {
  return apiRequest<PaymentSummary>(`/reservations/${reservationId}/payments`)
}

export function addPayment(reservationId: string, body: CreatePaymentBody): Promise<Payment> {
  return apiRequest<Payment>(`/reservations/${reservationId}/payments`, { method: 'POST', body })
}
