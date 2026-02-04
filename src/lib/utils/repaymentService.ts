import { EnhancedLoan, Installment } from '@/lib/api/types';

// Interface for payment request data
export interface PaymentRequest {
  loan_id: string;
  amount: number;
  payment_method: 'cash' | 'momo' | 'bank' | 'mpesa' | 'bank_transfer' | 'cheque';
  justification: string; // Required by Policy 2026-01-10
  recorded_by: string;
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
}

// Mock API function - replace with your actual API import
const api = {
  post: async (endpoint: string, data: any) => {
    // This is a mock - replace with your actual API call
    console.log(`API POST to ${endpoint}:`, data);
    return { success: true, data: { id: 'payment_123', ...data } };
  }
};

/**
 * Original repayment processing logic for local calculations
 */
export const calculateRepayment = (loan: EnhancedLoan, amount: number) => {
  let remainingPayment = Math.round(amount); // Enforce UGX whole numbers
  const updatedSchedule = [...(loan.installment_schedule || [])];
  
  // Logic: Oldest unpaid installments get paid first
  for (let inst of updatedSchedule) {
    if (remainingPayment <= 0) break;
    if (inst.status === 'paid') continue;

    const amountNeeded = inst.total_amount - (inst.paid_amount || 0);
    const paymentToThisInst = Math.min(remainingPayment, amountNeeded);

    inst.paid_amount = (inst.paid_amount || 0) + paymentToThisInst;
    remainingPayment -= paymentToThisInst;

    inst.status = inst.paid_amount >= inst.total_amount ? 'paid' : 'partial';
  }

  const totalOutstanding = (loan.metrics?.total_outstanding || 0) - amount;

  return {
    updatedSchedule,
    newBalance: Math.max(0, Math.round(totalOutstanding)),
    lifecycleStatus: totalOutstanding <= 0 ? 'completed' : loan.lifecycle_status
  };
};

/**
 * Calculate overdue penalty based on last payment date
 */
export const calculateOverduePenalty = (loan: EnhancedLoan) => {
  // Check if last_payment_date exists and is valid
  if (!loan.last_payment_date) {
    // If no last payment date, use loan start date as reference
    const startDate = new Date(loan.start_date);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Check if payments were due based on loan term
    if (diffDays > 7) {
      // Calculate weekly installment based on monthly payment
      const weeklyInstallment = loan.monthly_payment / 4.33; // Approximate weeks in a month
      // Standard Policy: 2% of weekly installment
      return Math.round(weeklyInstallment * 0.02);
    }
    return 0;
  }
  
  const lastPay = new Date(loan.last_payment_date);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastPay.getTime()) / (1000 * 3600 * 24));
  
  if (diffDays > 7) {
    // Calculate weekly installment based on monthly payment
    const weeklyInstallment = loan.monthly_payment / 4.33; // Approximate weeks in a month
    // Standard Policy: 2% of weekly installment
    return Math.round(weeklyInstallment * 0.02);
  }
  return 0;
};

/**
 * Main repayment processing function with audit logging
 * Processes payment and submits to API with governance compliance
 */
export const processRepayment = async (data: PaymentRequest) => {
  // 1. Log the local intent (Governance requirement - Policy 2026-01-10)
  console.log(`[AUDIT] Payment Intent: ${data.amount} UGX for Loan ${data.loan_id}`);
  console.log(`[AUDIT] Justification: ${data.justification}`);
  console.log(`[AUDIT] Method: ${data.payment_method}, Recorded By: ${data.recorded_by}`);
  console.log(`[AUDIT] Timestamp: ${new Date().toISOString()}`);
  
  // 2. Validate required fields (Governance compliance)
  if (!data.justification || data.justification.trim().length < 5) {
    throw new Error("Justification is required (minimum 5 characters) per Policy 2026-01-10");
  }
  
  if (data.amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }
  
  // 3. Add timestamp if not provided
  const paymentData = {
    ...data,
    payment_date: data.payment_date || new Date().toISOString().split('T')[0],
    amount: Math.round(data.amount) // Ensure whole UGX numbers
  };
  
  // 4. Submit to API
  try {
    console.log(`[AUDIT] Submitting payment to API...`);
    const response = await api.post('/payments', paymentData);
    
    // 5. Log successful submission
    console.log(`[AUDIT] Payment recorded successfully: ${response.data?.id || 'Unknown ID'}`);
    console.log(`[AUDIT] Justification permanently logged: "${data.justification}"`);
    
    return response;
  } catch (error: any) {
    // 6. Log failure with context
    console.error(`[AUDIT] Payment submission failed:`, error);
    console.error(`[AUDIT] Failed payment details:`, {
      loan_id: data.loan_id,
      amount: data.amount,
      justification: data.justification,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Payment processing failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Utility function to calculate total amount with penalty
 */
export const calculateTotalPaymentWithPenalty = (loan: EnhancedLoan, baseAmount: number) => {
  const penalty = calculateOverduePenalty(loan);
  return {
    baseAmount: Math.round(baseAmount),
    penalty: penalty,
    total: Math.round(baseAmount + penalty)
  };
};

/**
 * Generate audit log entry for payment
 */
export const createPaymentAuditEntry = (paymentData: PaymentRequest, result: any) => {
  return {
    timestamp: new Date().toISOString(),
    action: 'payment_received',
    performed_by: paymentData.recorded_by,
    justification: paymentData.justification,
    details: {
      amount: paymentData.amount,
      method: paymentData.payment_method,
      loan_id: paymentData.loan_id,
      payment_id: result.data?.id,
      receipt_number: paymentData.receipt_number
    }
  };
};