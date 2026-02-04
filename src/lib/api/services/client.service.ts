import { api } from '../client';
import { Client, CreateClientDto, UpdateClientDto } from '@/lib/types/client.types';
import { ApiResponse, PaginationParams } from '@/lib/types/api.types';

export class ClientService {
  static async getAllClients(params?: PaginationParams): Promise<ApiResponse<Client[]>> {
    return api.get<Client[]>('/clients', { params });
  }

  static async getClientById(id: string): Promise<ApiResponse<Client>> {
    return api.get<Client>(`/clients/${id}`);
  }

  static async createClient(data: CreateClientDto): Promise<ApiResponse<Client>> {
    return api.post<Client>('/clients', data);
  }

  static async updateClient(id: string, data: UpdateClientDto): Promise<ApiResponse<Client>> {
    return api.put<Client>(`/clients/${id}`, data);
  }

  static async deleteClient(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/clients/${id}`);
  }

  static async searchClients(query: string): Promise<ApiResponse<Client[]>> {
    return api.get<Client[]>(`/clients/search?q=${query}`);
  }

  static async uploadKYCDocument(clientId: string, file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('document', file);
    return api.upload<string>(`/clients/${clientId}/kyc`, formData);
  }

  static async getClientStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    blacklisted: number;
  }>> {
    return api.get('/clients/stats');
  }
}

export default ClientService;