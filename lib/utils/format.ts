export function formatCurrency(
  amount: number,
  currency: 'EUR' | 'USD' = 'EUR'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPriceRange(
  min: number,
  max?: number,
  currency: 'EUR' | 'USD' = 'EUR'
): string {
  if (!max) return formatCurrency(min, currency)
  return `${formatCurrency(min, currency)}–${formatCurrency(max, currency)}`
}
