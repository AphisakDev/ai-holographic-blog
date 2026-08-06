import pg from "pg";
import dotenv from "dotenv";
import { supabase } from "../config/supabase.js";

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.CONNECTION_STRING || process.env.DATABASE_URL
      ? { rejectUnauthorized: false }
      : false,
});

const originalQuery = pool.query.bind(pool);
pool.query = async function (text, params) {
  try {
    return await originalQuery(text, params);
  } catch (err) {
    console.warn("Direct PG Pool query error, using Supabase fallback:", err.message);
    const sqlText = (text || "").trim().toLowerCase();

    if (sqlText.startsWith("select")) {
      if (sqlText.includes("from users")) {
        const usernameOrId = params ? params[0] : null;
        let supabaseQuery = supabase.from("users").select("*");
        if (usernameOrId) {
          supabaseQuery = supabaseQuery.or(`id.eq.${usernameOrId},username.eq.${usernameOrId}`);
        }
        const { data } = await supabaseQuery;
        return { rows: data || [] };
      }
    } else if (sqlText.startsWith("insert into posts") || sqlText.startsWith("insert into articles")) {
      const title = params ? params[0] : "";
      const image = params ? params[1] : "";
      const category_id = params ? params[2] : 1;
      const description = params ? params[3] : "";
      const content = params ? params[4] : "";
      const status_id = params ? params[5] : 1;

      const { data } = await supabase
        .from("articles")
        .insert({
          title,
          image,
          category_id: parseInt(category_id) || 1,
          description,
          content,
          status: parseInt(status_id) === 2 ? "draft" : "published",
        })
        .select();

      return { rows: data || [] };
    }

    return { rows: [] };
  }
};

export const connectionPool = pool;
export default connectionPool;
