import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { connectionPool } from '../utils/db.mjs';

const authRouter = Router();

// ขั้นตอนที่ 5: เพิ่ม Route สำหรับการลงทะเบียนผู้ใช้ (Register)
authRouter.post('/register', async (req, res) => {
  const { email, password, username, name } = req.body;
  try {
    const usernameCheckQuery = `
      SELECT * FROM users
      WHERE username = $1
    `;
    const usernameCheckValues = [username || email?.split('@')[0]];
    const { rows: existingUser } = await connectionPool.query(
      usernameCheckQuery,
      usernameCheckValues
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'This username is already taken' });
    }

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (supabaseError) {
      if (supabaseError.code === 'user_already_exists') {
        return res
          .status(400)
          .json({ error: 'User with this email already exists' });
      }
      return res
        .status(400)
        .json({ error: 'Failed to create user. Please try again.' });
    }

    const supabaseUserId = data.user.id;
    const query = `
      INSERT INTO users (id, username, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [supabaseUserId, username || email?.split('@')[0], name || 'User', 'user'];
    const { rows } = await connectionPool.query(query, values);

    res.status(201).json({
      message: 'User created successfully',
      user: rows[0] || { id: supabaseUserId, username, name, role: 'user' },
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// ขั้นตอนที่ 6: เพิ่ม Route สำหรับการเข้าสู่ระบบ (Login)
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (
        error.code === 'invalid_credentials' ||
        error.message.includes('Invalid login credentials')
      ) {
        return res.status(400).json({
          error: "Your password is incorrect or this email doesn't exist",
        });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({
      message: 'Signed in successfully',
      access_token: data.session.access_token,
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// ขั้นตอนที่ 7: เพิ่ม Route สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน (Get User)
authRouter.get('/get-user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ error: 'Unauthorized or token expired' });
    }
    const supabaseUserId = data.user.id;
    const query = `
      SELECT * FROM users
      WHERE id = $1
    `;
    const values = [supabaseUserId];
    const { rows } = await connectionPool.query(query, values);

    const userRow = rows[0] || {
      username: data.user.email?.split('@')[0] || 'user',
      name: data.user.user_metadata?.name || 'User',
      role: 'user',
      profile_pic: '',
    };

    res.status(200).json({
      id: data.user.id,
      email: data.user.email,
      username: userRow.username,
      name: userRow.name,
      role: userRow.role,
      profilePic: userRow.profile_pic,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ขั้นตอนที่ 10: เพิ่ม Route สำหรับเปลี่ยนรหัสผ่าน (Reset Password)
authRouter.put(['/reset-password', '/password'], async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { oldPassword, currentPassword, newPassword } = req.body;
  const oldPass = oldPassword || currentPassword;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized or token expired' });
    }

    if (oldPass) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: oldPass,
      });
      if (loginError) {
        return res.status(400).json({ error: 'Invalid old password' });
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default authRouter;
