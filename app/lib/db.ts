import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "spms_db",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
