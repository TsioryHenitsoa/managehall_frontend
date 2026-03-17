export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = (end.getTime() - start.getTime()) / 3_600_000
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours % 1 === 0) return `${hours}h`
  return `${Math.floor(hours)}h${Math.round((hours % 1) * 60)}`
}

export function getPaymentStatus(paidAmount: number, totalAmount: number): 'paid' | 'partial' | 'unpaid' {
  if (paidAmount >= totalAmount) return 'paid'
  if (paidAmount > 0) return 'partial'
  return 'unpaid'
}

export function getPaymentStatusLabel(status: 'paid' | 'partial' | 'unpaid'): string {
  const labels = { paid: 'Payé', partial: 'Partiel', unpaid: 'Non payé' }
  return labels[status]
}
