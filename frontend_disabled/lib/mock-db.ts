// src/lib/mock-db.ts

export const MOCK_KEYS = {
  CLIENTS: 'mock_clients',
  LOANS: 'mock_loans',
  PAYMENTS: 'bingo_payments',
  STAFF: 'bingo_staff',      // Matches AuthContext
  AUDIT: 'bingo_audit_logs'  // Matches AuthContext
};

export const getMockData = (key: string) => {
  if (typeof window === 'undefined') return []; // Safety for SSR
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveMockData = (key: string, item: any) => {
  const existing = getMockData(key);
  const newItem = { 
    ...item, 
    id: item.id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString() 
  };
  localStorage.setItem(key, JSON.stringify([...existing, newItem]));
  return newItem;
};

/**
 * Specifically for reversals: Admin only
 */
export const deleteMockData = (key: string, id: string) => {
  const existing = getMockData(key);
  const filtered = existing.filter((item: any) => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
};