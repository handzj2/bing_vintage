// src/lib/api/types.ts

// ======================
// AUTHENTICATION TYPES
// ======================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'manager' | 'agent' | 'cashier';
    phone?: string;
    created_at: string;
    branch_id?: string;
    permissions?: string[];
  };
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Client Types - Updated with flat structure for CSV compatibility
export interface Client {
  id: string;
  client_number: string;
  
  // Basic Info
  first_name: string;
  last_name: string;
  full_name: string; // Added for CSV compatibility
  email: string;
  phone: string;
  alt_phone?: string;
  address: string; // Flat address string for CSV
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  date_of_birth: string;

  // KYC & ID
  id_type: string;
  id_number: string; // This maps to 'nin' in CSV
  nin: string; // Added for CSV compatibility
  id_issue_date?: string;
  id_expiry_date?: string;

  // Employment & Income
  occupation: string;
  employment_status: string;
  monthly_income: number;
  employer_name?: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;

  // Banking
  bank_name: string;
  bank_branch?: string;
  account_number: string;

  // Next of Kin
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  
  // References
  reference1_name?: string;
  reference1_phone?: string;
  reference2_name?: string;
  reference2_phone?: string;
  
  // Legacy fields (kept for backward compatibility)
  residential_address?: string;
  credit_score?: number;
  risk_category: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'blacklisted' | 'pending';
  created_at: string;
  updated_at: string;
  created_by: string;
  loans_count: number;
  active_loans: number;
  total_borrowed: number;
  total_repaid: number;
  
  // NEW FIELDS derived from Python context & policy:
  kyc_status: 'pending' | 'verified' | 'rejected'; // from db.py logic
  credit_limit: number;                            // from placeholder credit scoring
  gps_location?: string;                           // from asset recovery requirements
  justification: string;                           // REQUIRED per Policy 2026-01-10
}

// NEW: Flat CreateClientRequest matching CSV structure
export interface CreateClientRequest {
  // Basic Info
  first_name: string;
  last_name: string;
  full_name?: string; // For CSV compatibility, can be derived from first_name + last_name
  email?: string;
  phone: string;
  alt_phone?: string;
  address: string; // Flat address string
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  date_of_birth: string;

  // KYC & ID
  id_type: string;
  id_number: string; // This maps to 'nin' in CSV
  nin?: string; // Alternative name for id_number
  id_issue_date?: string;
  id_expiry_date?: string;

  // Employment & Income
  occupation: string;
  employment_status: string;
  monthly_income: number;
  employer_name?: string;
  business_name?: string;
  business_type?: string;
  business_address?: string;

  // Banking
  bank_name: string;
  bank_branch?: string;
  account_number: string;

  // Next of Kin
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  
  // References
  reference1_name?: string;
  reference1_phone?: string;
  reference2_name?: string;
  reference2_phone?: string;

  // NEW: Policy Compliance Fields
  kyc_status?: 'pending' | 'verified' | 'rejected';
  credit_limit?: number;
  residential_address?: string;
  gps_location?: string;
  justification: string; // REQUIRED per Policy 2026-01-10
}

// Legacy Client interface for backward compatibility
export interface LegacyClient {
  id: string;
  client_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  alt_phone?: string;
  id_type: 'national_id' | 'passport' | 'drivers_license' | 'other';
  id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  occupation: string;
  monthly_income: number;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  employment: {
    employer_name: string;
    employer_phone: string;
    employment_type: 'full_time' | 'part_time' | 'self_employed' | 'unemployed';
    years_employed: number;
  };
  kin: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  bank_details?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    branch: string;
  };
  credit_score?: number;
  risk_category: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'blacklisted' | 'pending';
  created_at: string;
  updated_at: string;
  created_by: string;
  loans_count: number;
  active_loans: number;
  total_borrowed: number;
  total_repaid: number;
}

// Loan Types
export interface Loan {
  id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  type: 'cash' | 'bike' | 'asset' | 'emergency';
  purpose: 'motorcycle_purchase' | 'business' | 'education' | 'medical' | 'home_improvement' | 'other';
  amount: number;
  interest_rate: number;
  term_months: number;
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'disbursed' | 'active' | 'overdue' | 'completed' | 'defaulted' | 'cancelled' | 'rejected';
  disbursement_method: 'cash' | 'bank_transfer' | 'MTNmomo' | 'Airtelmoney';
  start_date: string;
  end_date: string;
  disbursement_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  total_payable: number;
  monthly_payment: number;
  total_principal_paid: number;
  total_interest_paid: number;
  outstanding_balance: number;
  overdue_amount: number;
  days_overdue: number;
  payment_schedule: PaymentScheduleItem[];
  bike_details?: {
    bike_id: string;
    registration_number: string;
    make: string;
    model: string;
    year: number;
    engine_capacity: string;
    color: string;
    purchase_price: number;
    current_value: number;
    condition: string;
  };
}

export interface CreateLoanRequest {
  client_id: string;
  type: 'cash' | 'bike' | 'asset' | 'emergency';
  purpose: 'motorcycle_purchase' | 'business' | 'education' | 'medical' | 'home_improvement' | 'other';
  amount: number;
  interest_rate: number;
  term_months: number;
  disbursement_method: 'cash' | 'bank_transfer' | 'MTNmomo' | 'Airtelmoney';
  start_date: string;
  bike_id?: string;
  notes?: string;
}

export interface PaymentScheduleItem {
  installment: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}

// Payment Types
export interface Payment {
  id: string;
  payment_number: string;
  loan_id: string;
  loan_number: string;
  client_id: string;
  client_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'MTNmomo' | 'bank_transfer' | 'Airtelmoney';
  receipt_number?: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'MTNMomo' | 'bank_transfer' | 'Airtelmoney';
  receipt_number?: string;
  notes?: string;
}

// NEW: Payment Request Type with Audit Trail
export interface PaymentRequest {
  loan_id: string;
  amount: number;
  payment_method: 'cash' | 'MTNMomo' | 'bank_transfer' | 'Airtelmoney' | 'momo' | 'bank';
  justification: string; // REQUIRED: The reason for the transaction (Policy 2026-01-10)
  recorded_by: string;   // Admin/Staff ID
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
}

// Bike Types
export interface Bike {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  engine_capacity: string;
  color: string;
  status: 'available' | 'assigned' | 'maintenance' | 'sold' | 'lost';
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  category: 'sport' | 'commuter' | 'off_road' | 'scooter' | 'cruiser';
  location: string;
  assigned_to?: string;
  assigned_loan_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBikeRequest {
  registration_number: string;
  make: string;
  model: string;
  year: number;
  engine_capacity: string;
  color: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  category: 'sport' | 'commuter' | 'off_road' | 'scooter' | 'cruiser';
  location: string;
}

// Dashboard Types
export interface DashboardStats {
  totalClients: number;
  activeLoans: number;
  totalPortfolio: number;
  overdueLoans: number;
  collectionRate: number;
  kycCompletionRate: number;
  monthlyDisbursement: number;
  monthlyCollections: number;
  pendingApplications: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'loan_created' | 'payment_received' | 'client_registered' | 'loan_approved' | 'loan_disbursed';
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Report Types
export interface LoanReport {
  period: string;
  totalDisbursed: number;
  totalCollected: number;
  activeLoans: number;
  newLoans: number;
  overdueAmount: number;
  collectionRate: number;
}

export interface ClientReport {
  period: string;
  newClients: number;
  activeClients: number;
  kycCompletionRate: number;
  loanApprovalRate: number;
  defaultRate: number;
}

// Filter Types
export interface ClientFilters {
  search?: string;
  status?: string;
  risk_category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoanFilters {
  search?: string;
  status?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentFilters {
  loan_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
  page?: number;
  limit?: number;
}

// Guarantor & Collateral Types (for bike/asset loans)
export interface Guarantor {
  name: string;
  relationship: string;
  phone: string;
  id_number: string;
  id_type: 'national_id' | 'passport' | 'drivers_license';
  address: string;
  monthly_income: number;
  employer_name: string;
}

export interface Collateral {
  type: 'bike' | 'vehicle' | 'property' | 'equipment' | 'other';
  description: string;
  value: number;
  registration_number?: string;
  serial_number?: string;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  verified: boolean;
}

// API Request Types
export interface UpdateLoanStatusRequest {
  status: Loan['status'];
  notes?: string;
}

export interface UpdateClientStatusRequest {
  status: Client['status'];
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'payment_due' | 'loan_approval' | 'kyc_reminder' | 'system_alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Settings Types
export interface SystemSettings {
  interest_rates: {
    cash_loan_min: number;
    cash_loan_max: number;
    bike_loan_min: number;
    bike_loan_max: number;
    emergency_loan_min: number;
    emergency_loan_max: number;
  };
  loan_limits: {
    cash_loan_max: number;
    bike_loan_max: number;
    emergency_loan_max: number;
    asset_loan_max: number;
  };
  kyc_requirements: {
    cash_loan_min: number;
    bike_loan_min: number;
    emergency_loan_min: number;
  };
  payment_settings: {
    grace_period_days: number;
    late_fee_percentage: number;
    early_repayment_penalty: number;
  };
}

// =====================
// PHASE 1: LIFECYCLE EXTENSIONS
// =====================

export type LoanLifecycleStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'disbursed' 
  | 'active' 
  | 'delinquent' 
  | 'defaulted' 
  | 'completed';

export interface Installment {
  installment_number: number;
  due_date: string;
  principal_amount: number; // Always whole UGX
  interest_amount: number;  // Always whole UGX
  total_amount: number;     // Principal + Interest
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paid_amount: number;
  remaining_balance: number;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  performed_by: string;
  justification: string; // The "Why" behind the change
}

export interface EnhancedLoan extends Loan {
  lifecycle_status: LoanLifecycleStatus;
  installment_schedule: Installment[];
  
  metrics: {
    outstanding_principal: number;
    outstanding_interest: number;
    total_outstanding: number;
    total_paid: number;
    next_payment_date: string;
    next_payment_amount: number;
    days_in_arrears: number;
  };

  // NEW: Enhanced fields for detailed loan tracking
  engine_number: string;        // from bike_model.py
  chassis_number: string;       // from bike_model.py
  last_payment_date: string;    // Required for "The Gap" calculation
  
  // Enhanced audit trail with justification requirement
  audit_trail: Array<{
    timestamp: string;
    action: string;
    user: string;
    changes?: Record<string, { old: any; new: any }>;
  }>;
  
  // NEW: Audit logs with justification - Required per Policy 2026-01-10
  audit_logs: AuditEntry[];
}

// ======================
// NEW: LOAN CALCULATION TYPES
// ======================

export interface BikeLoanCalculationRequest {
  sale_price: number;          // Price shown to client
  deposit: number;             // Initial deposit
  weekly_installment?: number; // Weekly payment amount
  target_weeks?: number;       // Target number of weeks
  cost_price?: number;         // Admin only: actual cost
}

export interface BikeLoanCalculationResponse {
  success: boolean;
  data: {
    sale_price: number;
    deposit: number;
    weekly_installment: number;
    weeks_to_pay: number;
    total_payable: number;
    estimated_months: number;
    payment_schedule: WeeklyPaymentSchedule[];
    admin_data?: {
      total_profit: number;
      profit_percentage: number;
      implied_weekly_rate: number;
      implied_annual_rate: number;
      admin_outlay: number;
    };
  };
}

export interface WeeklyPaymentSchedule {
  week_number: number;
  due_date: string;
  amount: number;
  remaining_balance: number;
}

export interface CashLoanCalculationRequest {
  amount: number;
  term_months: number;
  interest_rate: number;
  start_date?: string;
}

export interface CashLoanCalculationResponse {
  success: boolean;
  data: {
    loan_amount: number;
    term_months: number;
    interest_rate: number;
    monthly_payment: number;
    total_payable: number;
    total_interest: number;
    payment_schedule: MonthlyPaymentSchedule[];
  };
}

export interface MonthlyPaymentSchedule {
  month_number: number;
  due_date: string;
  principal: number;
  interest: number;
  total_payment: number;
  remaining_balance: number;
}

// ======================
// EXTENDED LOAN TYPES FOR BIKE LOANS
// ======================

export interface BikeLoan extends Loan {
  // ✅ ADD THESE BIKE LOAN SPECIFIC FIELDS
  deposit?: number;                    // Initial deposit for bike loan
  weekly_installment?: number;         // Weekly payment amount
  weeks_to_pay?: number;               // Total weeks to complete payment
  sale_price?: number;                 // Bike sale price to client
  cost_price?: number;                 // Admin only: actual cost price
}

// Extended CreateLoanRequest for bike loans
export interface CreateBikeLoanRequest extends CreateLoanRequest {
  // ✅ ADD THESE OPTIONAL FIELDS FOR BIKE LOANS
  deposit?: number;           // For bike loans
  weekly_installment?: number; // For bike loans
  sale_price?: number;        // For bike loans
  cost_price?: number;        // Admin only for bike loans
  weeks_to_pay?: number;      // For bike loans
}

// ======================
// CALCULATION HELPER TYPES - UPDATED
// ======================

export interface LoanCalculationResult {
  monthly_payment: number;
  total_interest: number;
  total_payable: number;
  payment_schedule: PaymentScheduleItem[];
  mode: 'cash' | 'bike';
}

// For the frontend calculation utility - UPDATED WITH BIKE LOAN PROPERTIES
export interface CalculateLoanParams {
  amount: number;
  annual_interest_rate: number;
  term_months: number;
  start_date?: string;
  mode?: 'cash' | 'bike';
  penalty_rate?: number;
  
  // ✅ ADDED THESE BIKE LOAN SPECIFIC PROPERTIES
  deposit?: number;
  weekly_installment?: number;
  target_weeks?: number;
  cost_price?: number;
  sale_price?: number;
  weeks_to_pay?: number;
}

// ======================
// FORM DATA TYPES FOR FRONTEND
// ======================

export interface LoanFormData {
  // Common fields
  type: 'cash' | 'bike' | 'asset' | 'emergency';
  purpose: string;
  loan_amount: number;
  interest_rate: number;
  period_months: number;
  start_date: string;
  disbursement_method: string;
  client_id: string;
  notes?: string;
  
  // Bike loan specific fields
  bike_id?: string;
  deposit?: number;
  weekly_installment?: number;
  sale_price?: number;
  cost_price?: number;
  weeks_to_pay?: number;
  
  // Validation
  justification?: string; // Required for audit trail
}

// ======================
// API RESPONSE TYPES FOR CALCULATIONS
// ======================

export interface CalculationApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ======================
// BIKE LOAN PREVIEW TYPES
// ======================

export interface BikeLoanPreviewParams {
  sale_price: number;
  deposit: number;
  target_weeks?: number;
  target_monthly?: number;
}

export interface BikeLoanPreviewResponse {
  sale_price: number;
  deposit: number;
  weekly_installment: number;
  weeks_to_pay: number;
  total_payable: number;
  estimated_months: number;
}

// ======================
// COMPATIBILITY HELPER TYPES (FOR BACKWARD COMPATIBILITY)
// ======================

export interface CalculateLoanParamsExtended extends CalculateLoanParams {
  // Alternative property names for backward compatibility
  principal?: number;      // Alias for amount
  interestRate?: number;   // Alias for annual_interest_rate
  termMonths?: number;     // Alias for term_months
  startDate?: string;      // Alias for start_date
}

export function normalizeCalculateLoanParams(params: any): CalculateLoanParams {
  return {
    amount: params.amount ?? params.principal ?? 0,
    annual_interest_rate: params.annual_interest_rate ?? params.interestRate ?? 0,
    term_months: params.term_months ?? params.termMonths ?? 0,
    start_date: params.start_date ?? params.startDate,
    mode: params.mode,
    penalty_rate: params.penalty_rate,
    deposit: params.deposit,
    weekly_installment: params.weekly_installment,
    target_weeks: params.target_weeks,
    cost_price: params.cost_price,
    sale_price: params.sale_price,
    weeks_to_pay: params.weeks_to_pay
  };
}