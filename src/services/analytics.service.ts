import { apiRequest } from './api.service'
import type {
  AnalyticsOverview,
  TimeSeriesPoint,
  Granularity,
  TopSalle,
  PaymentMethodBreakdown,
} from '../types/analytics.types'

function buildQuery(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries).toString()
}

export function getOverview(from?: string, to?: string) {
  return apiRequest<AnalyticsOverview>(`/analytics/overview${buildQuery({ from, to })}`)
}

export function getReservationSeries(granularity?: Granularity, from?: string, to?: string) {
  return apiRequest<TimeSeriesPoint[]>(
    `/analytics/reservations/series${buildQuery({ granularity, from, to })}`
  )
}

export function getRevenueSeries(granularity?: Granularity, from?: string, to?: string) {
  return apiRequest<TimeSeriesPoint[]>(
    `/analytics/revenue/series${buildQuery({ granularity, from, to })}`
  )
}

export function getTopSalles(limit?: number, from?: string, to?: string) {
  return apiRequest<TopSalle[]>(
    `/analytics/salles/top${buildQuery({ limit: limit?.toString(), from, to })}`
  )
}

export function getPaymentMethods(from?: string, to?: string) {
  return apiRequest<PaymentMethodBreakdown[]>(
    `/analytics/payments/methods${buildQuery({ from, to })}`
  )
}
