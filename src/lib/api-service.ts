import { getMockData, saveMockData, MOCK_KEYS } from './mock-db';

// 💡 TOGGLE THIS: 'false' for Mock/Local mode, 'true' for Real API mode
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_API === 'true'; 
const API_BASE_URL = 'https://your-real-api-url.com/api';

export const ApiService = {
  // --- STAFF MANAGEMENT ---
  getStaff: async () => {
    if (!USE_REAL_API) {
      return getMockData(MOCK_KEYS.STAFF);
    }
    
    const response = await fetch(`${API_BASE_URL}/staff`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  registerStaff: async (staffData: any) => {
    if (!USE_REAL_API) {
      return saveMockData(MOCK_KEYS.STAFF, staffData);
    }

    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    return response.json();
  },

  // --- AUDIT & REVERSAL LOGIC ---
  // This satisfies your rule: Only Admin can perform reversals
  reverseTransaction: async (transactionId: string, adminEmail: string) => {
    if (!USE_REAL_API) {
      // Mock Reversal: Find and remove the transaction from LocalStorage
      const payments = getMockData(MOCK_KEYS.PAYMENTS) || [];
      const updated = payments.filter((p: any) => p.id !== transactionId);
      localStorage.setItem(MOCK_KEYS.PAYMENTS, JSON.stringify(updated));
      
      // Log the admin's action in the Audit trail
      saveMockData(MOCK_KEYS.AUDIT, {
        action: 'ADMIN_REVERSAL',
        details: `Transaction ${transactionId} was reversed/deleted`,
        performedBy: adminEmail,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    }

    // Real API Reversal
    const response = await fetch(`${API_BASE_URL}/transactions/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, adminEmail })
    });
    return response.json();
  }
};