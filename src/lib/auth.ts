// src/lib/auth.ts - Authentication utilities
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    role: 'customer' | 'organizer' | 'admin';
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    preferences: {
      language: 'en' | 'sw';
      currency: 'KES' | 'USD';
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
    };
    createdAt: string;
    lastLoginAt: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
    rememberMe: boolean;
  }
  
  export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    agreeToTerms: boolean;
    agreeToMarketing: boolean;
  }
  
  // API client for authentication
  export class AuthAPI {
    private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
    static async login(data: LoginData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
  
      return response.json();
    }
  
    static async register(data: RegisterData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
  
      return response.json();
    }
  
    static async getCurrentUser(token: string): Promise<User> {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
  
      return response.json();
    }
  
    static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
  
      return response.json();
    }
  
    static async forgotPassword(email: string): Promise<void> {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }
    }
  
    static async logout(token: string): Promise<void> {
      try {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Logout from client side even if server request fails
        console.error('Logout request failed:', error);
      }
    }
  }
  
  // Token management utilities
  export class TokenManager {
    private static readonly ACCESS_TOKEN_KEY = 'tiko_access_token';
    private static readonly REFRESH_TOKEN_KEY = 'tiko_refresh_token';
    private static readonly USER_KEY = 'tiko_user';
  
    static setTokens(accessToken: string, refreshToken: string): void {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  
    static getAccessToken(): string | null {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
  
    static getRefreshToken(): string | null {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
  
    static setUser(user: User): void {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  
    static getUser(): User | null {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
  
    static clearAll(): void {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  
    static isTokenExpired(token: string): boolean {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        return payload.exp < now;
      } catch {
        return true;
      }
    }
  }
  
  // Authentication hooks
  export function useAuth() {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
  
    const isAuthenticated = !!user;
  
    React.useEffect(() => {
      checkAuthStatus();
    }, []);
  
    const checkAuthStatus = async () => {
      try {
        const token = TokenManager.getAccessToken();
        const storedUser = TokenManager.getUser();
  
        if (!token || !storedUser) {
          setIsLoading(false);
          return;
        }
  
        // Check if token is expired
        if (TokenManager.isTokenExpired(token)) {
          await handleTokenRefresh();
          return;
        }
  
        setUser(storedUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        TokenManager.clearAll();
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleTokenRefresh = async () => {
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
  
        const response = await AuthAPI.refreshToken(refreshToken);
        TokenManager.setTokens(response.accessToken, response.refreshToken);
  
        // Get updated user data
        const userData = await AuthAPI.getCurrentUser(response.accessToken);
        TokenManager.setUser(userData);
        setUser(userData);
      } catch (error) {
        console.error('Token refresh failed:', error);
        TokenManager.clearAll();
        setUser(null);
      }
    };
  
    const login = async (data: LoginData) => {
      setIsLoading(true);
      try {
        const response = await AuthAPI.login(data);
        
        TokenManager.setTokens(response.accessToken, response.refreshToken);
        TokenManager.setUser(response.user);
        setUser(response.user);
        
        return response.user;
      } finally {
        setIsLoading(false);
      }
    };
  
    const register = async (data: RegisterData) => {
      setIsLoading(true);
      try {
        const response = await AuthAPI.register(data);
        
        TokenManager.setTokens(response.accessToken, response.refreshToken);
        TokenManager.setUser(response.user);
        setUser(response.user);
        
        return response.user;
      } finally {
        setIsLoading(false);
      }
    };
  
    const logout = async () => {
      try {
        const token = TokenManager.getAccessToken();
        if (token) {
          await AuthAPI.logout(token);
        }
      } finally {
        TokenManager.clearAll();
        setUser(null);
      }
    };
  
    return {
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshToken: handleTokenRefresh
    };
  }