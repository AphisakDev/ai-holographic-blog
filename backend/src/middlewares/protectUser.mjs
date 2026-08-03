import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://kopapmgkkrbeuyylgwqj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_tER4jD_RAcyG-Unvo_d1gQ_7se-LR35';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const protectUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // ดึง token จาก Authorization header
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.user = { ...data.user };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default protectUser;
