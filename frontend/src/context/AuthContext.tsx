import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthSession } from '../lib/authService';
import { 
  loginMock, 
  signUpMock, 
  logoutMock, 
  getCurrentSessionMock, 
  updateProfileMock, 
  updatePasswordMock,
  loginWithProviderMock
} from '../lib/authService';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<AuthSession>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (name: string, avatarUrl: string) => Promise<User>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ตรวจสอบข้อมูล Session ที่เคยล็อกอินไว้ตอนเริ่มแอปพลิเคชัน
  useEffect(() => {
    const session = getCurrentSessionMock();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setIsLoading(false);
  }, []);

  // โหลดข้อมูลการแจ้งเตือน (Notifications) อิงตามผู้ใช้งาน
  useEffect(() => {
    if (user) {
      const storageKey = `mock_notifications_${user.id}`;
      const savedNotis = localStorage.getItem(storageKey);
      if (savedNotis) {
        setNotifications(JSON.parse(savedNotis));
      } else {
        // สร้างการแจ้งเตือนเริ่มต้น (Default Mock Notifications)
        const defaultNotis: NotificationItem[] = [
          {
            id: 'noti-1',
            title: 'ยินดีต้อนรับสู่บล็อกใหม่ของคุณ!',
            message: 'ขอบคุณที่สมัครสมาชิกกับเรา คุณสามารถติดตามบทความและข่าวสารอัปเดตใหม่ๆ ได้ที่นี่',
            time: '2 นาทีที่แล้ว',
            isRead: false,
          },
          {
            id: 'noti-2',
            title: 'บทความเด่นวันนี้ 🚀',
            message: 'ห้ามพลาด! บทความการพัฒนาเว็บด้วย React 19 และ TailwindCSS v4 พร้อมเทคนิคจัดแต่งหน้าเว็บเพจ',
            time: '1 ชั่วโมงที่แล้ว',
            isRead: false,
          },
          {
            id: 'noti-3',
            title: 'แนะนำ: อัปเดตข้อมูลโปรไฟล์',
            message: 'แต่งเติมความเป็นตัวคุณได้ทันทีโดยการอัปโหลดรูปภาพโปรไฟล์ใหม่ได้ที่เมนู Profile',
            time: '3 ชั่วโมงที่แล้ว',
            isRead: false,
          }
        ];
        localStorage.setItem(storageKey, JSON.stringify(defaultNotis));
        setNotifications(defaultNotis);
      }
    } else {
      setNotifications([]);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const session = await loginMock(email, password);
      setUser(session.user);
      setToken(session.token);
      return session;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'facebook'): Promise<AuthSession> => {
    setIsLoading(true);
    try {
      const session = await loginWithProviderMock(provider);
      setUser(session.user);
      setToken(session.token);
      return session;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await signUpMock(name, email, password);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutMock();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (name: string, avatarUrl: string): Promise<User> => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ');
    setIsLoading(true);
    try {
      const updatedUser = await updateProfileMock(user.id, name, avatarUrl);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนทำรายการ');
    setIsLoading(true);
    try {
      await updatePasswordMock(user.id, currentPassword, newPassword);
    } finally {
      setIsLoading(false);
    }
  };

  // ทำเครื่องหมายว่าอ่านแล้วรายข้อ
  const markAsRead = (id: string) => {
    if (!user) return;
    const updated = notifications.map((noti) => 
      noti.id === id ? { ...noti, isRead: true } : noti
    );
    setNotifications(updated);
    localStorage.setItem(`mock_notifications_${user.id}`, JSON.stringify(updated));
  };

  // ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
  const markAllAsRead = () => {
    if (!user) return;
    const updated = notifications.map((noti) => ({ ...noti, isRead: true }));
    setNotifications(updated);
    localStorage.setItem(`mock_notifications_${user.id}`, JSON.stringify(updated));
  };

  // คำนวณจำนวนการแจ้งเตือนที่ยังไม่อ่าน
  const unreadCount = notifications.filter((noti) => !noti.isRead).length;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      loginWithProvider,
      signUp, 
      logout, 
      updateProfile, 
      updatePassword,
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
