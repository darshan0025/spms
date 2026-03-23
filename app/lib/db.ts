import { Pool, PoolClient } from "pg";

// Utility to convert MySQL "?" placeholders to PostgreSQL "$1, $2, ..."
function convertPlaceholders(query: string): string {
  let index = 1;
  return query.replace(/\?/g, () => `$${index++}`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Wrapper to mimic mysql2/promise interface
export const db = {
  async query(sql: string, params?: any[]) {
    const pgSql = convertPlaceholders(sql);
    const result = await pool.query(pgSql, params);
    
    // Mimic mysql2 return format [rows, fields]
    // Also add insertId if it's an INSERT operation (Postgres doesn't return this directly, 
    // but some of our queries might need it. We'll handle common cases.)
    const rows = result.rows;
    const mockResult = {
      insertId: rows[0]?.id || rows[0]?.student_id || rows[0]?.staff_id || rows[0]?.login_id || null,
      affectedRows: result.rowCount,
    };

    // If it's a SELECT, return [rows, fields]
    // If it's an INSERT/UPDATE/DELETE, return [mockResult, fields]
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
        return [rows, result.fields];
    } else {
        return [mockResult, result.fields];
    }
  },

  async getConnection() {
    const client = await pool.connect();
    
    // Wrap client to match mysql2 connection interface
    return {
      async query(sql: string, params?: any[]) {
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        const rows = result.rows;
        const mockResult = {
          insertId: rows[0]?.id || rows[0]?.student_id || rows[0]?.staff_id || rows[0]?.login_id || null,
          affectedRows: result.rowCount,
        };
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            return [rows, result.fields];
        } else {
            return [mockResult, result.fields];
        }
      },
      async beginTransaction() {
        await client.query("BEGIN");
      },
      async commit() {
        await client.query("COMMIT");
      },
      async rollback() {
        await client.query("ROLLBACK");
      },
      release() {
        client.release();
      }
    };
  },
  
  // Directly expose pool for advanced usage
  pool
};