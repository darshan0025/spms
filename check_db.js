const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function checkColumns() {
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

        const tablesRes = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        const tables = tablesRes.rows.map(t => t.table_name);

        for (const table of tables) {
            const res = await client.query(
                "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
                [table]
            );
            console.log(`${table.charAt(0).toUpperCase() + table.slice(1)} Columns:`, res.rows.map(r => r.column_name));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

checkColumns();
