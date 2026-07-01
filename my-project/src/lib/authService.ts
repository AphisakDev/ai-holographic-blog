/**
 * Mock Authentication Service
 * ทำหน้าที่จำลอง API call สำหรับสมัครสมาชิกและเข้าสู่ระบบ โดยมีการเก็บข้อมูลไว้ใน localStorage เพื่อทดสอบ Edge Case ต่างๆ
 */

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

const STORAGE_KEY_USERS = 'mock_users_db';
const STORAGE_KEY_CURRENT_USER = 'mock_current_user_session';

// ดึงข้อมูลผู้ใช้ทั้งหมดที่สมัครไว้ใน mock DB
const getUsersFromDB = (): any[] => {
  const usersJson = localStorage.getItem(STORAGE_KEY_USERS);
  return usersJson ? JSON.parse(usersJson) : [];
};

// บันทึกผู้ใช้เข้าไปใน mock DB
const saveUsersToDB = (users: any[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

/**
 * สมัครสมาชิก (Sign Up)
 * จำลองการเรียก API: POST /api/signup
 */
export const signUpMock = (name: string, email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    // จำลอง Network Latency 1 วินาที เพื่อแสดงผลโหลดของปุ่ม (Loading state)
    setTimeout(() => {
      const users = getUsersFromDB();
      
      // ตรวจสอบว่าอีเมลนี้เคยลงทะเบียนไว้แล้วหรือไม่
      const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return reject(new Error('This email is already registered.'));
      }

      // ตรวจสอบว่าเป็น Admin หรือไม่จาก Email (ถ้ามีคำว่า admin ให้เป็น admin)
      const role: 'admin' | 'user' = email.toLowerCase().includes('admin') ? 'admin' : 'user';

      // สร้าง User Object ใหม่
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email: email.toLowerCase(),
        password, // ในระบบจริงรหัสผ่านนี้จะต้องถูก Hash ก่อนบันทึก
        role,
        avatarUrl: '', // ไม่มีรูปในช่วงแรก
        createdAt: new Date().toISOString()
      };

      // บันทึกข้อมูลลง mock DB
      users.push(newUser);
      saveUsersToDB(users);

      // คืนค่า User ที่สมัครสำเร็จ (ยกเว้นรหัสผ่านเพื่อความปลอดภัย)
      resolve({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      });
    }, 1000);
  });
};

/**
 * เข้าสู่ระบบ (Log In)
 * จำลองการเรียก API: POST /api/login
 */
export const loginMock = (email: string, password: string): Promise<AuthSession> => {
  return new Promise((resolve, reject) => {
    // จำลอง Network Latency 1 วินาที
    setTimeout(() => {
      const users = getUsersFromDB();
      
      // ค้นหาผู้ใช้จากอีเมล
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return reject(new Error('Account not found.'));
      }

      // ตรวจสอบความถูกต้องของรหัสผ่าน
      if (user.password !== password) {
        return reject(new Error('Incorrect email or password.'));
      }

      // จำลอง Session token
      const token = `mock-jwt-token-${Math.random().toString(36).substring(2)}`;
      const sessionData: AuthSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatarUrl: user.avatarUrl || '',
          createdAt: user.createdAt
        },
        token
      };

      // บันทึก Session ปัจจุบันลงใน localStorage
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(sessionData));

      resolve(sessionData);
    }, 1000);
  });
};

/**
 * เข้าสู่ระบบด้วยผู้ให้บริการภายนอก (Social Login Mock)
 * จำลองการเรียก API: POST /api/login/provider
 */
export const loginWithProviderMock = (provider: 'google' | 'facebook'): Promise<AuthSession> => {
  return new Promise((resolve) => {
    // จำลอง Network Latency 1 วินาที
    setTimeout(() => {
      const users = getUsersFromDB();
      const email = `${provider}-user@domain.com`;
      const name = provider === 'google' ? 'Google User' : 'Facebook User';
      const avatarUrl = provider === 'google' 
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Google' 
        : 'https://api.dicebear.com/7.x/bottts/svg?seed=Facebook';

      // ค้นหาผู้ใช้จากอีเมลจำลอง
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        // หากยังไม่มีใน DB ให้สร้างผู้ใช้ใหม่
        user = {
          id: `${provider}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          email,
          role: 'user',
          avatarUrl,
          createdAt: new Date().toISOString()
        };
        // ใน DB จำลองจะมีฟิลด์ password ด้วย เผื่อกรณีใช้ร่วมกัน
        users.push({
          ...user,
          password: 'oauth-mock-password'
        });
        saveUsersToDB(users);
      }

      // จำลอง Session token
      const token = `mock-jwt-token-${provider}-${Math.random().toString(36).substring(2)}`;
      const sessionData: AuthSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatarUrl: user.avatarUrl || avatarUrl,
          createdAt: user.createdAt
        },
        token
      };

      // บันทึก Session ปัจจุบันลงใน localStorage
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(sessionData));

      resolve(sessionData);
    }, 1000);
  });
};


/**
 * ออกจากระบบ (Log Out)
 */
export const logoutMock = (): void => {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
};

/**
 * ตรวจสอบ Session ที่ยังคงค้างอยู่ใน localStorage
 */
export const getCurrentSessionMock = (): AuthSession | null => {
  const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!sessionJson) return null;
  try {
    const session = JSON.parse(sessionJson);
    
    // ดึงข้อมูลอัปเดตล่าสุดจาก DB เสมอ เพื่อให้หน้าเว็บเปลี่ยนตามโปรไฟล์ที่แก้
    const users = getUsersFromDB();
    const latestUser = users.find((u) => u.id === session.user.id);
    
    if (latestUser) {
      session.user = {
        id: latestUser.id,
        name: latestUser.name,
        email: latestUser.email,
        role: latestUser.role || 'user',
        avatarUrl: latestUser.avatarUrl || '',
        createdAt: latestUser.createdAt
      };
      // อัปเดตใน session storage กลับไปด้วย
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(session));
    }
    
    return session;
  } catch (error) {
    return null;
  }
};

/**
 * แก้ไขข้อมูลส่วนตัว (Update Profile)
 * จำลองการเรียก API: PUT /api/user
 */
export const updateProfileMock = (userId: string, name: string, avatarUrl: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsersFromDB();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return reject(new Error('User not found.'));
      }

      // อัปเดตข้อมูลใน DB
      users[userIndex].name = name;
      users[userIndex].avatarUrl = avatarUrl;
      saveUsersToDB(users);

      const updatedUser: User = {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role || 'user',
        avatarUrl: users[userIndex].avatarUrl,
        createdAt: users[userIndex].createdAt
      };

      // อัปเดต session ปัจจุบัน
      const sessionJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (sessionJson) {
        try {
          const session = JSON.parse(sessionJson);
          session.user = updatedUser;
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(session));
        } catch (e) {}
      }

      resolve(updatedUser);
    }, 1000);
  });
};

/**
 * เปลี่ยนรหัสผ่าน (Reset Password)
 * จำลองการเรียก API: PUT /api/user/password
 */
export const updatePasswordMock = (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsersFromDB();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return reject(new Error('User not found.'));
      }

      // ตรวจสอบรหัสผ่านปัจจุบัน
      if (users[userIndex].password !== currentPassword) {
        return reject(new Error('Current password is incorrect.'));
      }

      // อัปเดตข้อมูลรหัสผ่านใน DB
      users[userIndex].password = newPassword;
      saveUsersToDB(users);

      resolve();
    }, 1000);
  });
};
