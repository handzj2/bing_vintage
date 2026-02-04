import { api } from '../client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: any;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_active: boolean;
  created_at: string;
}

class AuthService {
  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  }

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  }

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/me');
    return response.data;
  }

  // Setup initial admin (if needed)
  async setupAdmin(data: { username: string; password: string; email?: string }) {
    const response = await api.post('/setup', data);
    return response.data;
  }

  // Logout (client-side only - backend may have token blacklist)
  logout(): void {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    // You might want to call a logout endpoint if your backend has one
    // await api.post('/logout');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  // Get stored user data
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Store user data
  storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;