// src/lib/api/client.ts - ENHANCED VERSION WITH PHASE 6, BACKEND SYNC & PHASE 8 SECURITY
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  LoginResponse, 
  LoginCredentials,
  Client,
  CreateClientRequest,
  Loan,
  CreateLoanRequest,
  Payment,
  CreatePaymentRequest,
  Bike,
  CreateBikeRequest,
  DashboardStats,
  RecentActivity,
  LoanStatusUpdateRequest,
  LoanDocument,
  ClientDocument,
  // ✅ ADD NEW IMPORTS FOR LOAN CALCULATION
  BikeLoanCalculationRequest,
  BikeLoanCalculationResponse,
  CashLoanCalculationRequest,
  CashLoanCalculationResponse,
  BikeLoanPreviewParams,
  BikeLoanPreviewResponse
} from './types';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private refreshPromise: Promise<LoginResponse> | null = null;
  private isOnline: boolean = true;
  private pendingRequests: Array<{
    method: string;
    url: string;
    data: any;
    timestamp: number;
  }> = [];

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds
      withCredentials: true, // For cookies if needed
    });

    this.setupInterceptors();
    this.setupConnectionMonitoring();
  }

  // ✅ ADD THIS METHOD INSIDE THE CLASS
  public setToken(token: string | null): void {
    if (token) {
      // This ensures every request sent via this.client includes the token
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  private setupInterceptors(): void {
    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add timestamp to prevent caching
        if (config.method?.toLowerCase() === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle network/connection errors
        if (!error.response) {
          console.warn('Network offline or server unreachable');
          this.isOnline = false;
          
          // Store request for later sync
          if (originalRequest.method && originalRequest.url) {
            this.pendingRequests.push({
              method: originalRequest.method,
              url: originalRequest.url,
              data: originalRequest.data,
              timestamp: Date.now()
            });
            this.savePendingRequests();
          }
          
          throw new Error('Network offline. Data saved locally for sync.');
        }
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.clearAuth();
            window.location.href = '/auth/login?session=expired';
          }
        }
        
        // Handle server errors
        if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
          throw new Error('Server error. Please try again later.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private setupConnectionMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingRequests();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      
      // Initial check
      this.isOnline = navigator.onLine;
    }
  }

  private savePendingRequests(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_api_requests', JSON.stringify(this.pendingRequests));
    }
  }

  private loadPendingRequests(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pending_api_requests');
      if (stored) {
        this.pendingRequests = JSON.parse(stored);
      }
    }
  }

  private async syncPendingRequests(): Promise<void> {
    if (!this.isOnline || this.pendingRequests.length === 0) return;
    
    console.log(`Syncing ${this.pendingRequests.length} pending requests...`);
    
    const successfulRequests: number[] = [];
    
    for (let i = 0; i < this.pendingRequests.length; i++) {
      const request = this.pendingRequests[i];
      try {
        await this.request('post', '/sync/process-pending', {
          request: {
            method: request.method,
            url: request.url,
            data: request.data
          }
        });
        successfulRequests.push(i);
      } catch (error) {
        console.error(`Failed to sync request ${i}:`, error);
      }
    }
    
    // Remove successful requests
    this.pendingRequests = this.pendingRequests.filter((_, index) => 
      !successfulRequests.includes(index)
    );
    this.savePendingRequests();
  }

  // ======================
  // TOKEN MANAGEMENT
  // ======================
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete this.client.defaults.headers.common['Authorization'];
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise.then(res => res.access_token);
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuth();
      return null;
    }

    this.refreshPromise = this.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken
    }).then(response => {
      if (response.success && response.data) {
        this.setTokens(response.data.access_token, response.data.refresh_token);
        return response.data;
      }
      throw new Error('Token refresh failed');
    }).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise.then(res => res.access_token).catch(() => null);
  }

  // ======================
  // PHASE 8: LOCAL GOVERNANCE CHECK
  // ======================
  
  /**
   * PHASE 8: LOCAL GOVERNANCE CHECK
   * Verifies if the current logged-in user has Admin rights.
   */
  isAdmin(): boolean {
    if (typeof window === 'undefined') return false;
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;
    try {
      const user = JSON.parse(userJson);
      return user.role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * PHASE 8: Get current user role
   */
  getUserRole(): string {
    if (typeof window === 'undefined') return 'guest';
    const userJson = localStorage.getItem('user');
    if (!userJson) return 'guest';
    try {
      const user = JSON.parse(userJson);
      return user.role || 'staff';
    } catch {
      return 'staff';
    }
  }

  /**
   * PHASE 8: Get current user info
   */
  getCurrentUser(): { name: string; role: string; id: string } | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * PHASE 8: Check if user can perform action based on role
   */
  canPerformAction(action: string): boolean {
    const role = this.getUserRole();
    
    // Define role-based permissions
    const permissions: Record<string, string[]> = {
      admin: [
        'create_payment', 'update_payment', 'delete_payment',
        'create_loan', 'update_loan', 'delete_loan',
        'create_client', 'update_client', 'delete_client',
        'view_reports', 'export_data', 'manage_users',
        'close_week', 'reset_data', 'audit_logs'
      ],
      manager: [
        'create_payment', 'update_payment',
        'create_loan', 'update_loan',
        'create_client', 'update_client',
        'view_reports', 'export_data'
      ],
      staff: [
        'create_payment',
        'view_clients', 'view_loans'
      ],
      guest: []
    };

    return permissions[role]?.includes(action) || false;
  }

  /**
   * PHASE 8: Enforcement of the 2026-01-10 Rule:
   * "They can't delete or edit a transaction after it's entered, only the admin can."
   */
  async deletePaymentSecure(paymentId: string): Promise<ApiResponse> {
    if (!this.isAdmin()) {
      // Logic-level block to prevent unauthorized local manipulation
      return { 
        success: false, 
        status: 403,
        message: "Governance Error: You do not have permission to reverse this transaction. Only administrators can delete payments." 
      };
    }
    // If Admin, proceed with deletion
    return this.delete(`/payments/${paymentId}`);
  }

  /**
   * PHASE 8: Secure payment update with role validation
   */
  async updatePaymentSecure(id: string, data: Partial<CreatePaymentRequest>): Promise<ApiResponse<Payment>> {
    const canUpdate = this.canPerformAction('update_payment');
    if (!canUpdate) {
      return {
        success: false,
        status: 403,
        message: "Permission denied: You cannot edit transactions. Contact your administrator."
      };
    }
    
    // Log audit trail for payment edits
    await this.logAuditEvent('PAYMENT_EDIT_ATTEMPT', `User attempted to edit payment ${id}`);
    
    return this.updatePayment(id, data);
  }

  /**
   * PHASE 8: Secure loan status update
   */
  async updateLoanStatusSecure(id: string, data: LoanStatusUpdateRequest): Promise<ApiResponse<Loan>> {
    if (data.status === 'written_off' || data.status === 'defaulted') {
      // Only admins can mark loans as written off or defaulted
      if (!this.isAdmin()) {
        return {
          success: false,
          status: 403,
          message: "Only administrators can mark loans as written off or defaulted."
        };
      }
    }
    
    return this.updateLoanStatus(id, data);
  }

  /**
   * PHASE 8: Secure loan creation with validation
   */
  async createLoanSecure(data: CreateLoanRequest): Promise<ApiResponse<Loan>> {
    if (data.amount > 1000000 && !this.isAdmin()) {
      // Large loans require admin approval
      return {
        success: false,
        status: 403,
        message: "Loans over 1,000,000 UGX require administrator approval."
      };
    }
    
    return this.createLoan(data);
  }

  /**
   * PHASE 8: Check if user can view sensitive reports
   */
  canViewFinancialReports(): boolean {
    const role = this.getUserRole();
    return ['admin', 'manager'].includes(role);
  }

  /**
   * PHASE 8: Check if user can export data
   */
  canExportData(): boolean {
    return this.canPerformAction('export_data');
  }

  /**
   * PHASE 8: Check if user can manage other users
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  // ======================
  // CORE HTTP METHODS (Enhanced)
  // ======================
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request({
        method,
        url,
        data,
        ...config,
      });

      // Handle paginated responses
      if (response.data?.data && response.data?.meta) {
        return {
          success: true,
          data: response.data.data as T,
          meta: response.data.meta,
          status: response.status,
        };
      }

      return {
        success: true,
        data: response.data as T,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`API ${method} ${url} failed:`, error);
      
      const apiError: ApiResponse = {
        success: false,
        status: error.response?.status,
        message: this.getErrorMessage(error),
      };

      // Add validation errors if present
      if (error.response?.data?.errors) {
        apiError.errors = error.response.data.errors;
      }

      return apiError;
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    if (!error.response) {
      return 'Network error. Please check your connection.';
    }
    
    return 'Request failed. Please try again.';
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('get', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('post', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('put', url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('patch', url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('delete', url, undefined, config);
  }

  // ======================
  // FILE UPLOAD METHOD
  // ======================
  async upload<T = any>(
    url: string, 
    formData: FormData, 
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });

      return {
        success: true,
        data: response.data as T,
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: this.getErrorMessage(error),
        status: error.response?.status,
      };
    }
  }

  // ======================
  // ✅ NEW: LOAN CALCULATION METHODS
  // ======================
  
  /**
   * ✅ NEW: Cash loan calculation
   */
  async calculateCashLoan(data: CashLoanCalculationRequest): Promise<ApiResponse<CashLoanCalculationResponse>> {
    return this.post('/loans/cash/calculate', data);
  }
  
  /**
   * ✅ NEW: Bike loan calculation
   */
  async calculateBikeLoan(data: BikeLoanCalculationRequest): Promise<ApiResponse<BikeLoanCalculationResponse>> {
    return this.post('/loans/bike/calculate', data);
  }
  
  /**
   * ✅ NEW: Bike loan preview
   */
  async previewBikeLoan(params: BikeLoanPreviewParams): Promise<ApiResponse<BikeLoanPreviewResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append('salePrice', params.sale_price.toString());
    queryParams.append('deposit', params.deposit.toString());
    
    if (params.target_weeks) {
      queryParams.append('targetWeeks', params.target_weeks.toString());
    }
    if (params.target_monthly) {
      queryParams.append('targetMonthly', params.target_monthly.toString());
    }
    
    return this.get(`/loans/bike/preview?${queryParams.toString()}`);
  }

  // ======================
  // AUTHENTICATION ENDPOINTS
  // ======================
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    if (response.success && response.data) {
      this.setTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/auth/logout');
    this.clearAuth();
    return response;
  }

  async getProfile(): Promise<ApiResponse<LoginResponse['user']>> {
    return this.get('/auth/profile');
  }

  // ======================
  // CLIENT ENDPOINTS - UPDATED FOR NEW CREATE CLIENT REQUEST STRUCTURE
  // ======================
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Client>>> {
    return this.get('/clients', { params });
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.get(`/clients/${id}`);
  }

  /**
   * ✅ UPDATED: createClient function - sends the entire flat payload to backend
   * This sends all 37 potential fields to your NestJS backend
   */
  async createClient(data: CreateClientRequest): Promise<ApiResponse<Client>> {
    // This sends all 37 potential fields to your NestJS backend
    return this.post<Client>('/clients', data);
  }

  /**
   * ✅ UPDATED: updateClient function for flat structure
   */
  async updateClient(id: string, data: Partial<CreateClientRequest>): Promise<ApiResponse<Client>> {
    return this.put(`/clients/${id}`, data);
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    return this.delete(`/clients/${id}`);
  }

  async bulkUploadClients(file: File, onProgress?: (progressEvent: ProgressEvent) => void): Promise<ApiResponse<{
    processed: number;
    failed: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.upload('/clients/bulk-upload', formData, onProgress);
  }

  async getClientDocuments(clientId: string): Promise<ApiResponse<ClientDocument[]>> {
    return this.get(`/clients/${clientId}/documents`);
  }

  async uploadClientDocument(
    clientId: string, 
    file: File, 
    type: string,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<ApiResponse<ClientDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.upload(`/clients/${clientId}/documents`, formData, onProgress);
  }

  // ======================
  // LOAN ENDPOINTS (ENHANCED)
  // ======================
  async getLoans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Loan>>> {
    return this.get('/loans', { params });
  }

  async getLoansDropdown(params?: { status?: string }): Promise<ApiResponse<Loan[]>> {
    return this.get('/loans/dropdown', { params });
  }

  async getLoan(id: string): Promise<ApiResponse<Loan>> {
    return this.get(`/loans/${id}`);
  }

  async createLoan(data: CreateLoanRequest): Promise<ApiResponse<Loan>> {
    return this.post('/loans', data);
  }

  async updateLoan(id: string, data: Partial<CreateLoanRequest>): Promise<ApiResponse<Loan>> {
    return this.patch(`/loans/${id}`, data);
  }

  async updateLoanStatus(id: string, data: LoanStatusUpdateRequest): Promise<ApiResponse<Loan>> {
    return this.patch(`/loans/${id}/status`, data);
  }

  async deleteLoan(id: string): Promise<ApiResponse> {
    return this.delete(`/loans/${id}`);
  }

  async getLoanPaymentSchedule(loanId: string): Promise<ApiResponse> {
    return this.get(`/loans/${loanId}/schedule`);
  }

  async getLoanDocuments(loanId: string): Promise<ApiResponse<LoanDocument[]>> {
    return this.get(`/loans/${loanId}/documents`);
  }

  async uploadLoanDocument(
    loanId: string, 
    file: File, 
    type: string,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<ApiResponse<LoanDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.upload(`/loans/${loanId}/documents`, formData, onProgress);
  }

  async calculateLoan(data: {
    amount: number;
    interest_rate: number;
    term_months: number;
  }): Promise<ApiResponse<{
    monthly_payment: number;
    total_payable: number;
    total_interest: number;
    schedule: Array<{
      installment: number;
      due_date: string;
      amount: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
  }>> {
    return this.post('/loans/calculate', data);
  }

  async bulkUploadLoans(file: File, onProgress?: (progressEvent: ProgressEvent) => void): Promise<ApiResponse<{
    processed: number;
    failed: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.upload('/loans/bulk-upload', formData, onProgress);
  }

  // ======================
  // PAYMENT ENDPOINTS (ENHANCED FOR DUAL-WRITE)
  // ======================
  async getPayments(params?: {
    page?: number;
    limit?: number;
    loan_id?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    return this.get('/payments', { params });
  }

  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.post('/payments', data);
  }

  async createPaymentWithReceipt(data: CreatePaymentRequest): Promise<ApiResponse<{
    payment: Payment;
    receipt_url: string;
    sms_sent: boolean;
  }>> {
    return this.post('/payments/with-receipt', data);
  }

  async updatePayment(id: string, data: Partial<CreatePaymentRequest>): Promise<ApiResponse<Payment>> {
    return this.put(`/payments/${id}`, data);
  }

  async deletePayment(id: string): Promise<ApiResponse> {
    return this.delete(`/payments/${id}`);
  }

  async getPaymentReceipt(id: string): Promise<ApiResponse<{ pdf_url: string }>> {
    return this.get(`/payments/${id}/receipt`);
  }

  async recordBulkPayments(
    payments: Array<{ loan_id: string; amount: number; payment_method: string }>
  ): Promise<ApiResponse<{ processed: number; failed: number }>> {
    return this.post('/payments/bulk', { payments });
  }

  // ======================
  // BIKE ENDPOINTS
  // ======================
  async getBikes(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    available?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Bike>>> {
    return this.get('/bikes', { params });
  }

  async getBike(id: string): Promise<ApiResponse<Bike>> {
    return this.get(`/bikes/${id}`);
  }

  async createBike(data: CreateBikeRequest): Promise<ApiResponse<Bike>> {
    return this.post('/bikes', data);
  }

  async updateBike(id: string, data: Partial<CreateBikeRequest>): Promise<ApiResponse<Bike>> {
    return this.put(`/bikes/${id}`, data);
  }

  async deleteBike(id: string): Promise<ApiResponse> {
    return this.delete(`/bikes/${id}`);
  }

  async updateBikeStatus(id: string, status: string): Promise<ApiResponse<Bike>> {
    return this.patch(`/bikes/${id}/status`, { status });
  }

  // ======================
  // PHASE 6: NOTIFICATION ENDPOINTS
  // ======================
  async sendSMS(data: { to: string; message: string }): Promise<ApiResponse> {
    return this.post('/notifications/send-sms', data);
  }

  async sendBulkSMS(notifications: Array<{ to: string; message: string }>): Promise<ApiResponse<{
    sent: number;
    failed: number;
    details: Array<{
      to: string;
      status: 'sent' | 'failed';
      message_id?: string;
      error?: string;
    }>;
  }>> {
    return this.post('/notifications/bulk-sms', { notifications });
  }

  async getSMSLogs(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    recipient?: string;
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    recipient: string;
    message: string;
    status: 'sent' | 'failed' | 'delivered';
    cost: number;
    sent_at: string;
    delivery_status?: string;
  }>>> {
    return this.get('/notifications/sms-logs', { params });
  }

  async sendPaymentReceiptSMS(paymentId: string, customMessage?: string): Promise<ApiResponse<{
    sms_sent: boolean;
    message_id?: string;
  }>> {
    return this.post(`/payments/${paymentId}/send-receipt-sms`, {
      custom_message: customMessage
    });
  }

  // ======================
  // AUDIT LOG ENDPOINTS
  // ======================
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    action?: string;
    performed_by?: string;
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    action: string;
    details: string;
    performed_by: string;
    timestamp: string;
    ip_address?: string;
  }>>> {
    return this.get('/audit/logs', { params });
  }

  async logAuditEvent(action: string, details: string): Promise<ApiResponse> {
    return this.post('/audit/log', {
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // ======================
  // SYNC ENDPOINTS (FOR OFFLINE SUPPORT)
  // ======================
  async syncLocalData(localData: {
    payments?: any[];
    clients?: any[];
    loans?: any[];
  }): Promise<ApiResponse<{
    synced: {
      payments: number;
      clients: number;
      loans: number;
    };
    conflicts: any[];
  }>> {
    return this.post('/sync/data', localData);
  }

  async getSyncStatus(): Promise<ApiResponse<{
    last_sync: string;
    pending_items: number;
    conflicts: number;
  }>> {
    return this.get('/sync/status');
  }

  // ======================
  // DASHBOARD ENDPOINTS
  // ======================
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get('/dashboard/stats');
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<RecentActivity[]>> {
    return this.get('/dashboard/activity', { params: { limit } });
  }

  async getCollectionsReport(startDate: string, endDate: string): Promise<ApiResponse> {
    return this.get('/dashboard/collections', {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  // ======================
  // REPORT ENDPOINTS
  // ======================
  async generateLoanReport(params: {
    start_date: string;
    end_date: string;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<{ report_url: string }>> {
    return this.post('/reports/loans', params);
  }

  async generateClientReport(params: {
    start_date: string;
    end_date: string;
    risk_category?: string;
  }): Promise<ApiResponse<{ report_url: string }>> {
    return this.post('/reports/clients', params);
  }

  async generateFinancialReport(params: {
    start_date: string;
    end_date: string;
    report_type: 'monthly' | 'quarterly' | 'yearly';
  }): Promise<ApiResponse<{ report_url: string }>> {
    return this.post('/reports/financial', params);
  }

  async generateCollectionReport(params: {
    start_date: string;
    end_date: string;
    collector_id?: string;
  }): Promise<ApiResponse<{ report_url: string }>> {
    return this.post('/reports/collections', params);
  }

  // ======================
  // UTILITY METHODS
  // ======================
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }

  // ======================
  // OFFLINE SUPPORT METHODS
  // ======================
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  getPendingRequestCount(): number {
    return this.pendingRequests.length;
  }

  async retryFailedRequests(): Promise<void> {
    await this.syncPendingRequests();
  }

  // ======================
  // MOCK DATA METHODS FOR DEVELOPMENT
  // ======================
  private getMockData<T>(data: T, delay = 500): Promise<ApiResponse<T>> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
          status: 200,
        });
      }, delay);
    });
  }

  async getMockLoans(): Promise<ApiResponse<PaginatedResponse<Loan>>> {
    const mockLoans: Loan[] = [
      {
        id: '1',
        loan_number: 'LN-2024-001',
        client_id: 'C001',
        client_name: 'John Smith',
        client_phone: '+256712345678',
        type: 'cash',
        purpose: 'business',
        amount: 50000,
        interest_rate: 12,
        term_months: 24,
        status: 'active',
        disbursement_method: 'mpesa',
        disbursement_date: '2024-01-15',
        start_date: '2024-01-15',
        end_date: '2026-01-15',
        created_at: '2024-01-10',
        updated_at: '2024-01-10',
        created_by: 'admin',
        total_payable: 56000,
        monthly_payment: 2333.33,
        total_principal_paid: 10000,
        total_interest_paid: 1000,
        outstanding_balance: 45000,
        overdue_amount: 0,
        days_overdue: 0,
        payment_schedule: [],
      },
    ];

    return this.getMockData({
      data: mockLoans,
      meta: {
        total: mockLoans.length,
        page: 1,
        per_page: 10,
        total_pages: 1,
      },
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Hook for using API in components
export function useApi() {
  return api;
}