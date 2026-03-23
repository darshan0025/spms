const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function testConnection() {
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in .env.local");
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connection to Neon successful!");
    
    // Check if tables exist
    const res = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("Tables in database:", res.rows.map(t => t.table_name));
    
    // Check student table columns
    const colRes = await client.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'student'"
    );
    console.log("Student columns:", colRes.rows.map(c => c.column_name));

  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await client.end();
  }
}

testConnection();
