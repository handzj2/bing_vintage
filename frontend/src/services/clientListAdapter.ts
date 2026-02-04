// src/services/clientListAdapter.ts
import { Client } from '@/lib/api/types';

// Convert API response (flat camelCase) to Client type (nested snake_case)
export const apiClientToClient = (apiClient: any): Client => {
  return {
    id: apiClient.id ? String(apiClient.id) : '',
    client_number: apiClient.clientNumber || `CL-${apiClient.id || '000'}`,
    first_name: apiClient.firstName || apiClient.first_name || '',
    last_name: apiClient.lastName || apiClient.last_name || '',
    full_name: apiClient.fullName || `${apiClient.firstName || ''} ${apiClient.lastName || ''}`.trim(),
    email: apiClient.email || '',
    phone: apiClient.phone || '',
    address: {
      street: apiClient.address || apiClient.street_address || '',
      city: apiClient.city || '',
      state: apiClient.state || '',
      postal_code: apiClient.postalCode || apiClient.postal_code || '',
      country: apiClient.country || 'Uganda'
    },
    nin: apiClient.nin || apiClient.idNumber || '',
    id_number: apiClient.nin || apiClient.idNumber || '',
    occupation: apiClient.occupation || '',
    employment_status: apiClient.employmentStatus?.toLowerCase() || '',
    monthly_income: parseFloat(apiClient.monthlyIncome) || 0,
    bank_details: {
      bank_name: apiClient.bankName || apiClient.bank_name || '',
      account_number: apiClient.accountNumber || apiClient.account_number || '',
      account_name: apiClient.accountName || `${apiClient.firstName || ''} ${apiClient.lastName || ''}`.trim(),
      branch: apiClient.bankBranch || apiClient.branch || ''
    },
    kin: {
      name: apiClient.nextOfKinName || apiClient.kin_name || '',
      phone: apiClient.nextOfKinPhone || apiClient.kin_phone || '',
      relationship: apiClient.nextOfKinRelationship || apiClient.kin_relationship || '',
      address: apiClient.kin_address || ''
    },
    business: {
      name: apiClient.businessName || '',
      type: apiClient.businessType || '',
      address: apiClient.businessAddress || ''
    },
    date_of_birth: apiClient.dateOfBirth ? apiClient.dateOfBirth.split('T')[0] : '',
    gender: apiClient.gender?.toLowerCase() || '',
    marital_status: apiClient.maritalStatus?.toLowerCase() || '',
    status: apiClient.status || 'active',
    created_at: apiClient.createdAt || apiClient.created_at || new Date().toISOString(),
    updated_at: apiClient.updatedAt || apiClient.updated_at || new Date().toISOString(),
    loans_count: apiClient.loans?.length || 0,
    active_loans: apiClient.loans?.filter((loan: any) => loan.status === 'active').length || 0,
    credit_score: parseFloat(apiClient.creditScore) || 0,
    risk_category: apiClient.riskCategory || 'medium'
  };
};