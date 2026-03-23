const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function getStudent() {
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
    const res = await client.query("SELECT username, password, role FROM login WHERE role = 'STUDENT' LIMIT 5");
    console.log(JSON.stringify(res.rows));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

getStudent().catch(console.error);
