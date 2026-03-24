const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function fixData() {
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
        console.log("Connected. Fixing project_group_id in project_group_member table...");

        // Update members to belong to groups
        // Assign students 1, 2, 3 to group 1
        await client.query("UPDATE project_group_member SET project_group_id = 1 WHERE student_id IN (1, 2, 3)");
        
        // Assign students 4, 5, 6 to group 2
        await client.query("UPDATE project_group_member SET project_group_id = 2 WHERE student_id IN (4, 5, 6)");

        console.log("Data fixed. Verifying...");
        
        const res = await client.query("SELECT * FROM project_group_member");
        console.log(res.rows);

    } catch (error) {
        console.error("Failed to fix data:", error);
    } finally {
        await client.end();
    }
}

fixData();
