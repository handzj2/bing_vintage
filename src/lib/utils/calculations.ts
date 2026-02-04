// src/lib/utils/calculations.ts

import { 
  CashLoanCalculationResponse, 
  BikeLoanCalculationResponse,
  LoanCalculationResult,
  CalculateLoanParams,
  WeeklyPaymentSchedule,
  MonthlyPaymentSchedule
} from '@/lib/api/types';

// ==================== CORE CONSTANTS ====================
const WEEKS_PER_MONTH = 4.33; // Average weeks in a month
const MONTHS_PER_YEAR = 12;

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate loan amount (no hardcoded limits)
 */
export const validateLoanAmount = (amount: number): { valid: boolean; message?: string } => {
  if (!amount || amount <= 0) {
    return { valid: false, message: 'Please enter a valid loan amount' };
  }
  return { valid: true };
};

/**
 * Validate bike loan deposit
 */
export const validateBikeDeposit = (
  salePrice: number,
  deposit: number,
  minPercentage: number = 10
): { valid: boolean; message: string; minDeposit: number } => {
  const minDeposit = Math.ceil(salePrice * (minPercentage / 100));
  
  if (deposit < minDeposit) {
    return {
      valid: false,
      message: `Deposit too low. Minimum ${minPercentage}%: ${formatCurrency(minDeposit)}`,
      minDeposit
    };
  }
  
  if (deposit >= salePrice) {
    return {
      valid: false,
      message: 'Deposit must be less than sale price',
      minDeposit
    };
  }
  
  return {
    valid: true,
    message: 'Deposit is acceptable',
    minDeposit
  };
};

// ==================== CASH LOAN CALCULATIONS ====================

/**
 * Calculate cash loan EMI (reducing balance method)
 * Returns whole UGX numbers (no decimals)
 */
export const calculateCashLoanEMI = (
  principal: number,
  annualInterestRate: number,
  termMonths: number,
  startDate: string = new Date().toISOString().split('T')[0]
): LoanCalculationResult => {
  // Validate inputs
  if (principal <= 0 || annualInterestRate <= 0 || termMonths <= 0) {
    return {
      monthly_payment: 0,
      total_interest: 0,
      total_payable: 0,
      payment_schedule: [],
      mode: 'cash'
    };
  }

  // Monthly interest rate (decimal)
  const monthlyRate = (annualInterestRate / 100) / MONTHS_PER_YEAR;
  
  // EMI formula: [P × r × (1+r)^n] / [(1+r)^n - 1]
  const rawEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) 
                 / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const monthlyPayment = Math.round(rawEMI);
  const totalPayable = monthlyPayment * termMonths;
  const totalInterest = totalPayable - principal;

  // Generate payment schedule
  const paymentSchedule: MonthlyPaymentSchedule[] = [];
  let remainingBalance = principal;
  const start = new Date(startDate);

  for (let month = 1; month <= termMonths; month++) {
    const interest = remainingBalance * monthlyRate;
    const principalPaid = rawEMI - interest;
    const newBalance = Math.max(0, remainingBalance - principalPaid);

    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + month);

    paymentSchedule.push({
      month_number: month,
      due_date: dueDate.toISOString().split('T')[0],
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      total_payment: monthlyPayment,
      remaining_balance: Math.round(newBalance)
    });

    remainingBalance = newBalance;
  }

  return {
    monthly_payment: monthlyPayment,
    total_interest: Math.round(totalInterest),
    total_payable: Math.round(totalPayable),
    payment_schedule: paymentSchedule,
    mode: 'cash'
  };
};

// ==================== BIKE LOAN CALCULATIONS ====================

/**
 * Calculate bike loan (flat rate, weekly payments)
 * Returns whole UGX numbers (no decimals)
 */
export const calculateBikeLoan = (
  salePrice: number,
  deposit: number,
  weeklyInstallment?: number,
  targetWeeks?: number,
  costPrice?: number
): {
  weeksToPay: number;
  totalPayable: number;
  weeklyPayment: number;
  estimatedMonths: number;
  paymentSchedule: WeeklyPaymentSchedule[];
  adminData?: {
    totalProfit: number;
    profitPercentage: number;
    impliedWeeklyRate: number;
    impliedAnnualRate: number;
    adminOutlay: number;
  };
} => {
  // Validate
  if (deposit >= salePrice) {
    throw new Error('Deposit must be less than sale price');
  }

  // Determine weekly payment
  let weeklyPayment = weeklyInstallment;
  
  if (targetWeeks && !weeklyPayment) {
    // Calculate from target weeks
    const balance = salePrice - deposit;
    weeklyPayment = Math.ceil(balance / targetWeeks);
  } else if (!weeklyPayment) {
    // Default: 1 year (52 weeks)
    const balance = salePrice - deposit;
    weeklyPayment = Math.ceil(balance / 52);
  }

  if (weeklyPayment <= 0) {
    throw new Error('Weekly payment must be greater than 0');
  }

  // Calculate weeks to pay
  const balance = salePrice - deposit;
  const weeksRaw = balance / weeklyPayment;
  const weeksToPay = Math.ceil(weeksRaw);
  const totalPayable = deposit + (weeklyPayment * weeksToPay);

  // Generate payment schedule
  const paymentSchedule: WeeklyPaymentSchedule[] = [];
  let remainingBalance = balance;
  const startDate = new Date();

  for (let week = 1; week <= weeksToPay; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + (week * 7));
    remainingBalance = Math.max(0, remainingBalance - weeklyPayment);

    paymentSchedule.push({
      week_number: week,
      due_date: dueDate.toISOString().split('T')[0],
      amount: weeklyPayment,
      remaining_balance: Math.round(remainingBalance)
    });
  }

  // Admin profit calculation (if cost price provided)
  let adminData = undefined;
  if (costPrice && costPrice > 0) {
    const totalProfit = salePrice - costPrice;
    const adminOutlay = costPrice - deposit;
    const weeklyRate = (salePrice / adminOutlay - 1) / weeksToPay;
    const annualRate = weeklyRate * 52 * 100;

    adminData = {
      totalProfit: Math.round(totalProfit),
      profitPercentage: Math.round((totalProfit / costPrice) * 100),
      impliedWeeklyRate: Math.round(weeklyRate * 100),
      impliedAnnualRate: Math.round(annualRate),
      adminOutlay: Math.round(adminOutlay)
    };
  }

  return {
    weeksToPay,
    totalPayable: Math.round(totalPayable),
    weeklyPayment,
    estimatedMonths: Math.ceil(weeksToPay / WEEKS_PER_MONTH),
    paymentSchedule,
    adminData
  };
};

/**
 * Quick bike loan calculation for 1 year
 */
export const calculateBikeLoanOneYear = (
  salePrice: number,
  deposit: number,
  costPrice?: number
) => {
  const balance = salePrice - deposit;
  const weeklyPayment = Math.ceil(balance / 52); // 52 weeks = 1 year
  return calculateBikeLoan(salePrice, deposit, weeklyPayment, undefined, costPrice);
};

/**
 * Calculate bike loan from target monthly payment
 */
export const calculateBikeLoanFromMonthly = (
  salePrice: number,
  deposit: number,
  targetMonthly: number,
  costPrice?: number
) => {
  const weeklyPayment = Math.ceil(targetMonthly / WEEKS_PER_MONTH);
  return calculateBikeLoan(salePrice, deposit, weeklyPayment, undefined, costPrice);
};

// ==================== UNIVERSAL CALCULATOR ====================

/**
 * Universal loan calculator - handles both cash and bike loans
 */
export const calculateLoan = (
  params: CalculateLoanParams
): LoanCalculationResult | ReturnType<typeof calculateBikeLoan> => {
  const { amount, annual_interest_rate, term_months, start_date, mode, penalty_rate } = params;
  
  if (mode === 'bike') {
    // For bike loans, we need salePrice and deposit
    const salePrice = amount;
    const deposit = params.deposit || 0;
    const weeklyInstallment = params.weekly_installment;
    const targetWeeks = params.target_weeks;
    const costPrice = params.cost_price;
    
    return calculateBikeLoan(salePrice, deposit, weeklyInstallment, targetWeeks, costPrice);
  } else {
    // Cash loan
    return calculateCashLoanEMI(amount, annual_interest_rate, term_months, start_date);
  }
};

// ==================== CONVERSION HELPERS ====================

/**
 * Convert weeks to months
 */
export const weeksToMonths = (weeks: number): number => {
  return Math.ceil(weeks / WEEKS_PER_MONTH);
};

/**
 * Convert months to weeks
 */
export const monthsToWeeks = (months: number): number => {
  return Math.ceil(months * WEEKS_PER_MONTH);
};

/**
 * Convert weekly payment to monthly (for display)
 */
export const weeklyToMonthly = (weekly: number): number => {
  return Math.round(weekly * WEEKS_PER_MONTH);
};

/**
 * Convert monthly payment to weekly
 */
export const monthlyToWeekly = (monthly: number): number => {
  return Math.ceil(monthly / WEEKS_PER_MONTH);
};

/**
 * Calculate implied interest rate for bike loan
 */
export const calculateImpliedBikeInterest = (
  costPrice: number,
  salePrice: number,
  deposit: number,
  weeksToPay: number
): { weeklyRate: number; annualRate: number } => {
  const adminOutlay = costPrice - deposit;
  const weeklyRate = (salePrice / adminOutlay - 1) / weeksToPay;
  const annualRate = weeklyRate * 52 * 100;
  
  return {
    weeklyRate: Math.round(weeklyRate * 10000) / 100, // To 2 decimal places
    annualRate: Math.round(annualRate * 100) / 100
  };
};

// ==================== PAYMENT SCHEDULE GENERATORS ====================

/**
 * Generate detailed payment schedule for cash loans
 */
export const generateCashPaymentSchedule = (
  principal: number,
  monthlyPayment: number,
  annualInterestRate: number,
  termMonths: number,
  startDate: Date = new Date()
): MonthlyPaymentSchedule[] => {
  const schedule: MonthlyPaymentSchedule[] = [];
  let remainingBalance = principal;
  const monthlyRate = (annualInterestRate / 100) / MONTHS_PER_YEAR;

  for (let month = 1; month <= termMonths; month++) {
    const interest = remainingBalance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    const newBalance = Math.max(0, remainingBalance - principalPaid);

    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + month);

    schedule.push({
      month_number: month,
      due_date: dueDate.toISOString().split('T')[0],
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      total_payment: monthlyPayment,
      remaining_balance: Math.round(newBalance)
    });

    remainingBalance = newBalance;
  }

  return schedule;
};

/**
 * Generate weekly payment schedule for bike loans
 */
export const generateBikePaymentSchedule = (
  totalAmount: number,
  weeklyPayment: number,
  startDate: Date = new Date()
): WeeklyPaymentSchedule[] => {
  const schedule: WeeklyPaymentSchedule[] = [];
  const totalWeeks = Math.ceil(totalAmount / weeklyPayment);
  let remainingBalance = totalAmount;

  for (let week = 1; week <= totalWeeks; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + (week * 7));
    
    remainingBalance = Math.max(0, remainingBalance - weeklyPayment);

    schedule.push({
      week_number: week,
      due_date: dueDate.toISOString().split('T')[0],
      amount: weeklyPayment,
      remaining_balance: Math.round(remainingBalance)
    });
  }

  return schedule;
};

// ==================== FORMATTING FUNCTIONS ====================

/**
 * Format currency in UGX (no decimals)
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return 'UGX 0';
  
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB');
  } catch {
    return 'Invalid Date';
  }
};

// ==================== QUICK CALCULATORS ====================

/**
 * Quick calculator for common scenarios
 */
export const quickCalculators = {
  // Bike loan for 1 year
  bikeOneYear: (salePrice: number, deposit: number, costPrice?: number) => {
    return calculateBikeLoanOneYear(salePrice, deposit, costPrice);
  },
  
  // Bike loan for 2 years
  bikeTwoYears: (salePrice: number, deposit: number, costPrice?: number) => {
    const balance = salePrice - deposit;
    const weeklyPayment = Math.ceil(balance / 104); // 104 weeks = 2 years
    return calculateBikeLoan(salePrice, deposit, weeklyPayment, undefined, costPrice);
  },
  
  // Cash loan comparison
  cashLoanComparison: (amount: number, interestRate: number) => {
    return {
      '6_months': calculateCashLoanEMI(amount, interestRate, 6),
      '12_months': calculateCashLoanEMI(amount, interestRate, 12),
      '24_months': calculateCashLoanEMI(amount, interestRate, 24),
      '36_months': calculateCashLoanEMI(amount, interestRate, 36),
    };
  },
  
  // Calculate maximum loan amount based on income
  maxLoanByIncome: (monthlyIncome: number, debtToIncomeRatio: number = 0.4) => {
    const maxMonthlyPayment = monthlyIncome * debtToIncomeRatio;
    // Assuming 12% interest, 24 months term
    const monthlyRate = 0.12 / 12;
    const termMonths = 24;
    
    const maxLoan = maxMonthlyPayment * ((Math.pow(1 + monthlyRate, termMonths) - 1) / 
                  (monthlyRate * Math.pow(1 + monthlyRate, termMonths)));
    
    return Math.round(maxLoan);
  }
};

// ==================== EXPORT ALL FUNCTIONS ====================

export default {
  // Cash loan functions
  calculateCashLoanEMI,
  
  // Bike loan functions
  calculateBikeLoan,
  calculateBikeLoanOneYear,
  calculateBikeLoanFromMonthly,
  
  // Universal calculator
  calculateLoan,
  
  // Validation
  validateLoanAmount,
  validateBikeDeposit,
  
  // Conversion helpers
  weeksToMonths,
  monthsToWeeks,
  weeklyToMonthly,
  monthlyToWeekly,
  calculateImpliedBikeInterest,
  
  // Schedule generators
  generateCashPaymentSchedule,
  generateBikePaymentSchedule,
  
  // Formatting
  formatCurrency,
  formatPercentage,
  formatDate,
  
  // Quick calculators
  quickCalculators
};