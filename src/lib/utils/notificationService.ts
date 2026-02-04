import { EnhancedLoan } from '@/lib/api/types';

export const generateReminders = (loan: EnhancedLoan) => {
  const today = new Date();
  const dueDate = new Date(loan.metrics.next_payment_date);
  
  // Calculate days remaining
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Reminder: Your payment of UGX ${loan.metrics.next_payment_amount.toLocaleString()} is due tomorrow. Please ensure your account is funded.`;
  }

  if (loan.status === 'delinquent') {
    return `URGENT: Your loan is overdue. A late fee of UGX 5,000 has been applied. Current balance: UGX ${loan.metrics.total_outstanding.toLocaleString()}. Please pay immediately to avoid further penalties.`;
  }

  return null;
};