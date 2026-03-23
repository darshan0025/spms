const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
const envPath = path.resolve(__dirname, '.env.local');
const envData = fs.readFileSync(envPath, 'utf8');
const databaseUrlMatch = envData.match(/^DATABASE_URL=(.*)$/m);
const databaseUrl = databaseUrlMatch ? databaseUrlMatch[1].trim() : null;

async function createDocsTable() {
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
        console.log("Connected. Creating documents table...");

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
                project_group_id INTEGER REFERENCES project_group(project_group_id),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Documents table created or verified.");

    } catch (error) {
        console.error("Failed to create docs table:", error);
    } finally {
        await client.end();
    }
}

createDocsTable();
