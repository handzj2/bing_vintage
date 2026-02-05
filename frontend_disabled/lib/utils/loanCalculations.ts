// src/lib/utils/loanCalculations.ts

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  paymentSchedule: PaymentScheduleItem[];
  mode: 'bike' | 'cash';
}

export interface PaymentScheduleItem {
  installment: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  penaltyAmount: number; 
  status: 'pending' | 'paid' | 'overdue';
}

/**
 * CLEAN VALIDATION: Removed hardcoded limits.
 * Checks only if the input is a valid positive number.
 */
export const validateLoanAmount = (amount: number): { valid: boolean; message?: string } => {
  if (!amount || amount <= 0) {
    return { valid: false, message: 'Please enter a valid loan amount' };
  }
  return { valid: true };
};

/**
 * UGX STANDARD CALCULATION
 * All results are rounded to whole numbers (no decimals).
 * Penalty fixation removed; it is now dynamic based on input.
 */
export const calculateLoan = (
  amount: number,
  annualInterestRate: number,
  termMonths: number,
  startDate: string = new Date().toISOString().split('T')[0],
  mode: 'bike' | 'cash' = 'cash',
  penaltyRate: number = 0 // Pass as decimal, e.g., 0.01 for 1%
): LoanCalculationResult => {
  if (amount <= 0 || annualInterestRate <= 0 || termMonths <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalPayable: 0, paymentSchedule: [], mode };
  }

  const isWeekly = mode === 'bike';
  const totalInstallments = isWeekly ? termMonths * 4 : termMonths;
  
  // Periodic rate: (Annual Rate / 100) / (periods per year)
  const periodicRate = (annualInterestRate / 100) / (isWeekly ? 52 : 12);
  
  // Amortization Formula (EMI)
  const rawInstallment = amount * periodicRate * Math.pow(1 + periodicRate, totalInstallments) / 
    (Math.pow(1 + periodicRate, totalInstallments) - 1);

  const totalPayable = rawInstallment * totalInstallments;
  const totalInterest = totalPayable - amount;

  const paymentSchedule: PaymentScheduleItem[] = [];
  let remainingBalance = amount;
  const start = new Date(startDate);

  for (let i = 1; i <= totalInstallments; i++) {
    const interest = remainingBalance * periodicRate;
    const principal = rawInstallment - interest;
    const newBalance = Math.max(0, remainingBalance - principal);

    const dueDate = new Date(start);
    if (isWeekly) {
      dueDate.setDate(start.getDate() + (i * 7));
    } else {
      dueDate.setMonth(start.getMonth() + i);
    }

    paymentSchedule.push({
      installment: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principal: Math.round(principal),
      interest: Math.round(interest),
      totalPayment: Math.round(rawInstallment),
      remainingBalance: Math.round(newBalance),
      penaltyAmount: Math.round(rawInstallment * penaltyRate),
      status: 'pending'
    });

    remainingBalance = newBalance;
  }

  return {
    monthlyPayment: Math.round(rawInstallment),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
    paymentSchedule,
    mode
  };
};

/**
 * UGX STANDARD FORMATTING
 * No decimals, uses UGX currency symbol and Ugandan locale.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};