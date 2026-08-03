import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import connectionPool from '../utils/db.mjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kopapmgkkrbeuyylgwqj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_tER4jD_RAcyG-Unvo_d1gQ_7se-LR35';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    const supabaseUserId = data.user.id;
    const query = `
      SELECT role FROM users
      WHERE id = $1
    `;
    const values = [supabaseUserId];
    const { rows } = await connectionPool.query(query, values);
    if (!rows.length) {
      // Fallback check metadata role if user table row not created yet
      const role = data.user.user_metadata?.role || (data.user.email?.includes('admin') ? 'admin' : 'user');
      rows.push({ role });
    }
    req.user = { ...data.user, role: rows[0].role };
    if (req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden: You do not have admin access' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default protectAdmin;
