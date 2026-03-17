export interface AnalyticsOverview {
  range: {
    from: string | null
    to: string | null
  }
  reservations: {
    total: number
    cancelled: number
    cancellationRate: number
  }
  finance: {
    bookedAmount: number
    paidAmount: number
    remainingAmount: number
    realizedRevenue: number
    averageRevenuePerReservation: number
  }
  activity: {
    activeSalles: number
    uniqueCustomers: number
  }
}

export interface TimeSeriesPoint {
  period: string
  value: number
}

export type Granularity = 'day' | 'week' | 'month'

export interface TopSalle {
  salleId: string
  salleLabel: string
  building: string
  reservations: number
  bookedAmount: number
  paidAmount: number
}

export interface PaymentMethodBreakdown {
  method: string
  count: number
  amount: number
  percentage: number
}
