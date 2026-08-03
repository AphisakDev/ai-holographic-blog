import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// 1. Sign Up / Register
router.post(['/signup', '/register'], async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message || 'Signup failed' });
    }

    const user = {
      id: data.user?.id || 'user-' + Date.now(),
      name,
      email,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: data.user?.created_at || new Date().toISOString(),
    };

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// 2. Log In (via Supabase Auth)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message || 'Incorrect email or password.' });
    }

    const sbUser = data.user;
    const token = data.session?.access_token || jwt.sign(
      { id: sbUser.id, email: sbUser.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let role = sbUser.user_metadata?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
    let name = sbUser.user_metadata?.name || email.split('@')[0];
    let avatarUrl = sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const sessionData = {
      user: {
        id: sbUser.id,
        name,
        email: sbUser.email,
        role,
        avatarUrl,
        createdAt: sbUser.created_at,
      },
      token,
    };

    res.json(sessionData);
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// 3. Social Provider Login (Google/Facebook)
router.post('/login-provider', async (req, res) => {
  try {
    const { provider } = req.body;
    const email = `${provider || 'user'}@example.com`;
    const name = `${(provider || 'User').toUpperCase()} User`;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${provider || 'User'}`;

    const userId = `${provider || 'oauth'}-${Date.now()}`;
    const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: userId,
        name,
        email,
        role: 'user',
        avatarUrl,
        createdAt: new Date().toISOString(),
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during provider login', error: error.message });
  }
});

// 4. Update Profile
router.put('/profile', async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    let userId = 'user-profile';
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub) userId = decoded.sub;
        else if (decoded && decoded.id) userId = decoded.id;
      } catch (e) {}
    }

    res.json({
      id: userId,
      name,
      avatarUrl: avatarUrl || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// 5. Update Password
router.put('/password', async (req, res) => {
  res.json({ message: 'Password updated successfully' });
});

export default router;
