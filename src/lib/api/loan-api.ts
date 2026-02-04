// lib/api/loan-api.ts
import { api } from './client';

export const loanApi = {
  // Get loan details
  getLoan: async (loanId: string) => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get loan error:', error);
      throw error;
    }
  },

  // Update loan with proper error handling
  updateLoan: async (loanId: string, data: any) => {
    try {
      const response = await api.patch(`/loans/${loanId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update loan error:', error);
      
      // Format error messages for display
      if (error.response?.data?.errors) {
        const formattedErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          formattedErrors[field] = (messages as string[]).join(', ');
        });
        throw { formattedErrors, original: error };
      }
      
      throw error;
    }
  },

  // Check if loan can be edited
  checkEditPermissions: async (loanId: string) => {
    try {
      const response = await api.get(`/loans/${loanId}/edit-permissions`);
      return response.data;
    } catch (error) {
      console.error('Check permissions error:', error);
      throw error;
    }
  },

  // Get loan audit log
  getAuditLog: async (loanId: string) => {
    try {
      const response = await api.get(`/loans/${loanId}/audit-log`);
      return response.data;
    } catch (error) {
      console.error('Get audit log error:', error);
      throw error;
    }
  }
};