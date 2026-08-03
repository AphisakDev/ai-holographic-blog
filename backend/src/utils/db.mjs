import pg from 'pg';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase.js';

dotenv.config();

const { Pool } = pg;

// Supabase PostgreSQL direct connection string or Pool
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

export const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Wrapper object matching `connectionPool.query(...)` interface
export const connectionPool = {
  async query(text, params) {
    try {
      if (process.env.DATABASE_URL) {
        return await pool.query(text, params);
      }
    } catch (e) {
      console.warn('Direct PG Pool query error, using Supabase client fallback:', e.message);
    }

    // Smart Fallback using Supabase JS client to mimic pg query response
    const sqlText = text.trim();
    if (sqlText.toLowerCase().startsWith('select')) {
      if (sqlText.includes('username =')) {
        const username = params[0];
        const { data } = await supabase.from('users').select('*').eq('username', username);
        return { rows: data || [] };
      }
    } else if (sqlText.toLowerCase().startsWith('insert into users')) {
      const [id, username, name, role] = params;
      const { data } = await supabase
        .from('users')
        .insert({ id, username, name, role: role || 'user' })
        .select();

      return { rows: data || [{ id, username, name, role: role || 'user' }] };
    }

    return { rows: [] };
  },
};
