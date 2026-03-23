const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function addPhoneColumn() {
    if (!databaseUrl) {
        console.error("DATABASE_URL not found in .env.local");
        return;
    }

    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Connecting to database...");
        await client.connect();
        console.log("Connected.");

        // Add column to staff table if missing
        try {
            await client.query("ALTER TABLE staff ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to staff table");
        } catch (e) {
            if (e.code === '42701') {
                console.log("phone_no already exists in staff table");
            } else {
                console.error("Error adding phone_no to staff:", e.message);
            }
        }

        // Add column to student table if missing
        try {
            await client.query("ALTER TABLE student ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to student table");
        } catch (e) {
            if (e.code === '42701') {
                console.log("phone_no already exists in student table");
            } else {
                console.error("Error adding phone_no to student:", e.message);
            }
        }

        // Create documents table
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS documents (
                    doc_id SERIAL PRIMARY KEY,
                    file_name VARCHAR(255) NOT NULL,
                    file_url VARCHAR(512) NOT NULL,
                    file_id VARCHAR(255) NOT NULL,
                    file_type VARCHAR(100),
                    file_size BIGINT,
                    uploaded_by INTEGER NOT NULL,
                    uploader_role VARCHAR(20) NOT NULL,
                    group_id INTEGER,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("Created documents table (or already exists)");
        } catch (e) {
            console.error("Error creating documents table:", e.message);
        }

        console.log("Migration complete.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
    }
}

addPhoneColumn();
