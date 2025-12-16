/**
 * Helper functions for tracking and verifying recurring subscription payments
 */

export interface PaymentHealthCheck {
  order_id: string
  subscription_id: string | null
  status: 'healthy' | 'late' | 'overdue' | 'missing'
  next_charge_date: string | null
  last_payment_date: string | null
  days_overdue: number | null
  expected_charge_number: number | null
  last_charge_number: number | null
}

/**
 * Calculate expected next charge date based on billing frequency
 */
export function calculateNextChargeDate(
  lastPaymentDate: Date,
  billingFrequency: 'monthly' | 'annual'
): Date {
  const nextDate = new Date(lastPaymentDate)
  
  if (billingFrequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1)
  } else if (billingFrequency === 'annual') {
    nextDate.setMonth(nextDate.getMonth() + 12)
  }
  
  return nextDate
}

/**
 * Check if a payment is overdue based on next_charge_date
 */
export function isPaymentOverdue(nextChargeDate: string | null | Date): {
  isOverdue: boolean
  daysOverdue: number | null
} {
  if (!nextChargeDate) {
    return { isOverdue: false, daysOverdue: null }
  }
  
  const nextDate = typeof nextChargeDate === 'string' 
    ? new Date(nextChargeDate) 
    : nextChargeDate
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  nextDate.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    isOverdue: daysDiff > 0,
    daysOverdue: daysDiff > 0 ? daysDiff : null
  }
}

/**
 * Determine payment health status
 */
export function getPaymentHealthStatus(
  nextChargeDate: string | null,
  lastPaymentDate: string | null,
  isActive: boolean
): 'healthy' | 'late' | 'overdue' | 'missing' {
  if (!isActive || !nextChargeDate) {
    return 'missing'
  }
  
  const { isOverdue, daysOverdue } = isPaymentOverdue(nextChargeDate)
  
  if (!isOverdue) {
    return 'healthy'
  }
  
  // If overdue by more than 7 days, consider it overdue
  // If overdue by 1-7 days, consider it late
  if (daysOverdue && daysOverdue > 7) {
    return 'overdue'
  }
  
  return 'late'
}

