import { apiRequest } from './api.service'
import type { Salle, CreateSalleBody, UpdateSalleBody, AvailabilityResponse } from '../types/salle.types'

export function getSalles(params?: { type?: string; building?: string }): Promise<Salle[]> {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.building) query.set('building', params.building)
  const qs = query.toString()
  return apiRequest<Salle[]>(`/salles${qs ? `?${qs}` : ''}`)
}

export function getSalleById(id: string): Promise<Salle> {
  return apiRequest<Salle>(`/salles/${id}`)
}

export function getAvailableSalles(start: string, end: string): Promise<Salle[]> {
  return apiRequest<Salle[]>(`/salles/disponibles?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
}

export function getSalleAvailability(id: string, date: string): Promise<AvailabilityResponse> {
  return apiRequest<AvailabilityResponse>(`/salles/${id}/disponibilites?date=${date}`)
}

export function createSalle(body: CreateSalleBody): Promise<Salle> {
  return apiRequest<Salle>('/salles', { method: 'POST', body })
}

export function updateSalle(id: string, body: UpdateSalleBody): Promise<Salle> {
  return apiRequest<Salle>(`/salles/${id}`, { method: 'PUT', body })
}

export function deleteSalle(id: string): Promise<void> {
  return apiRequest<void>(`/salles/${id}`, { method: 'DELETE' })
}
