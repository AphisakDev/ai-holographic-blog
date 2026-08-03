export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

const STORAGE_KEY_CURRENT_USER = 'mock_current_user_session';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE = `${BASE_URL}/auth`;

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    } catch (e) {
      console.error('Error parsing session for auth headers:', e);
    }
  }
  return headers;
};

/**
 * สมัครสมาชิกผ่าน Express Backend -> Supabase
 */
export const signUpMock = async (name: string, email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
};

/**
 * เข้าสู่ระบบผ่าน Express Backend -> Supabase
 */
export const loginMock = async (email: string, password: string): Promise<AuthSession> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Email หรือ Password ไม่ถูกต้อง');
  }

  const sessionData: AuthSession = await response.json();
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(sessionData));
  return sessionData;
};

/**
 * Social Provider Login
 */
export const loginWithProviderMock = async (provider: 'google' | 'facebook'): Promise<AuthSession> => {
  const response = await fetch(`${API_BASE}/login-provider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Provider login failed');
  }

  const sessionData: AuthSession = await response.json();
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(sessionData));
  return sessionData;
};

/**
 * ออกจากระบบ
 */
export const logoutMock = (): void => {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
};

/**
 * ตรวจสอบ Session ที่คงค้างใน localStorage
 */
export const getCurrentSessionMock = (): AuthSession | null => {
  const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!sessionJson) return null;
  try {
    return JSON.parse(sessionJson);
  } catch (error) {
    return null;
  }
};

/**
 * แก้ไขข้อมูลส่วนตัว
 */
export const updateProfileMock = async (_userId: string, name: string, avatarUrl: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, avatarUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Update profile failed');
  }

  const updatedUser: User = await response.json();
  const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (sessionJson) {
    try {
      const session = JSON.parse(sessionJson);
      session.user = updatedUser;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(session));
    } catch (e) {}
  }

  return updatedUser;
};

/**
 * เปลี่ยนรหัสผ่าน
 */
export const updatePasswordMock = async (_userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Update password failed');
  }
};
