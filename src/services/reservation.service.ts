import { apiRequest } from './api.service'
import type { Reservation, CreateReservationBody, UpdateReservationBody } from '../types/reservation.types'

export function getReservations(): Promise<Reservation[]> {
  return apiRequest<Reservation[]>('/reservations')
}

export function getReservationById(id: string): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`)
}

export function createReservation(body: CreateReservationBody): Promise<Reservation> {
  return apiRequest<Reservation>('/reservations', { method: 'POST', body })
}

export function updateReservation(id: string, body: UpdateReservationBody): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`, { method: 'PUT', body })
}

export function cancelReservation(id: string): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}/cancel`, { method: 'PATCH' })
}
