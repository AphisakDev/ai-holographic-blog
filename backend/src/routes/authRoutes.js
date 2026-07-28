import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// Helper to find user by customId or _id
const findUserById = async (id) => {
  let user = await User.findOne({ customId: id });
  if (!user && id.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(id);
  }
  return user;
};

// 1. Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      avatarUrl: ''
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

// 2. Log In
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Account not found.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const userId = user.customId || user._id.toString();

    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sessionData = {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt
      },
      token
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

    if (!provider || (provider !== 'google' && provider !== 'facebook')) {
      return res.status(400).json({ message: 'Valid provider (google or facebook) is required' });
    }

    const email = `${provider}-user@domain.com`.toLowerCase();
    const name = provider === 'google' ? 'Google User' : 'Facebook User';
    const avatarUrl = provider === 'google' 
      ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Google' 
      : 'https://api.dicebear.com/7.x/bottts/svg?seed=Facebook';

    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash('oauth-mock-password', 10);
      user = await User.create({
        customId: `${provider}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        avatarUrl
      });
    }

    const userId = user.customId || user._id.toString();

    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const sessionData = {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatarUrl: user.avatarUrl || avatarUrl,
        createdAt: user.createdAt
      },
      token
    };

    res.json(sessionData);
  } catch (error) {
    res.status(500).json({ message: 'Server error during provider login', error: error.message });
  }
});

// 4. Update Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// 5. Update Password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating password', error: error.message });
  }
});

export default router;
