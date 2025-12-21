import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Token management
export const TOKEN_KEY = 'niko_free_token';
export const USER_KEY = 'niko_free_user';

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// API Types
interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

// Register user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(API_ENDPOINTS.auth.register, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Registration failed');
  }

  // Store token and user data
  if (responseData.access_token) {
    setToken(responseData.access_token);
    setUser(responseData.user);
  }

  return responseData;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Login failed');
  }

  // Store token and user data
  if (responseData.access_token) {
    setToken(responseData.access_token);
    setUser(responseData.user);
  }

  return responseData;
};

// Logout user
export const logout = () => {
  removeToken();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Get authenticated fetch headers
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Forgot password - request reset token
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Failed to send reset email');
  }

  return responseData;
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password: newPassword }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Failed to reset password');
  }

  return responseData;
};

// Partner login
interface PartnerLoginData {
  email: string;
  password: string;
}

interface PartnerAuthResponse {
  access_token: string;
  refresh_token?: string;
  partner: {
    id: number;
    email: string;
    business_name: string;
    status: string;
  };
}

export const partnerLogin = async (data: PartnerLoginData): Promise<PartnerAuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/partner/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Login failed');
  }

  // Store token and partner data
  if (responseData.access_token) {
    localStorage.setItem('niko_free_partner_token', responseData.access_token);
    localStorage.setItem('niko_free_partner', JSON.stringify(responseData.partner));
  }

  return responseData;
};

