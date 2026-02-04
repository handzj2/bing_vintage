import { EnhancedLoan } from '@/lib/api/types';

export const checkDelinquency = (loan: EnhancedLoan) => {
  const today = new Date();
  const dueDate = new Date(loan.metrics.next_payment_date); //

  // If today is past the due date and the loan isn't already paid
  if (today > dueDate && loan.lifecycle_status === 'active') {
    const LATE_FEE = 5000; // Fixed 5,000 UGX penalty for late payment
    
    return {
      isOverdue: true,
      newStatus: 'delinquent' as const,
      // Apply the penalty to the outstanding balance
      updatedBalance: Math.round(loan.metrics.total_outstanding + LATE_FEE),
      penaltyApplied: LATE_FEE
    };
  }

  return { isOverdue: false, newStatus: loan.lifecycle_status, updatedBalance: loan.metrics.total_outstanding };
};