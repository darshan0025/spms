const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function fixSchema() {
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
        console.log("Connected to Neon. Applying fixes...");

        // 1. Fix staff table
        try {
            await client.query("ALTER TABLE staff ADD COLUMN department_id INTEGER REFERENCES department(department_id)");
            console.log("Added department_id to staff");
        } catch (e) { console.log("staff.department_id fix: " + e.message); }

        try {
            await client.query("ALTER TABLE staff ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to staff");
        } catch (e) { console.log("staff.phone_no fix: " + e.message); }

        // 2. Fix student table
        try {
            await client.query("ALTER TABLE student ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to student");
        } catch (e) { console.log("student.phone_no fix: " + e.message); }

        // 3. Fix documents table (rename group_id to project_group_id if it exists)
        try {
            // Check if project_group_id already exists
            const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'project_group_id'");
            if (res.rowCount === 0) {
                await client.query("ALTER TABLE documents RENAME COLUMN group_id TO project_group_id");
                console.log("Renamed group_id to project_group_id in documents table");
            } else {
                console.log("project_group_id already exists in documents");
            }
        } catch (e) { console.log("documents.project_group_id fix: " + e.message); }

        console.log("Schema fixes applied successfully.");

    } catch (error) {
        console.error("Fix failed:", error);
    } finally {
        await client.end();
    }
}

fixSchema();
