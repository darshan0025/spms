
const mysql = require('mysql2/promise');

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "darshan12*123",
    database: "spms_db",
};

async function addPhoneColumn() {
    try {
        console.log("Connecting to database...");
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        // Add column to staff table if missing
        try {
            await connection.query("ALTER TABLE staff ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to staff table");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("phone_no already exists in staff table");
            } else {
                console.error("Error adding phone_no to staff:", e.message);
            }
        }

        // Add column to student table if missing
        try {
            await connection.query("ALTER TABLE student ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to student table");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("phone_no already exists in student table");
            } else {
                console.error("Error adding phone_no to student:", e.message);
            }
        }

        // Create documents table
        try {
            await connection.query(`
                CREATE TABLE IF NOT EXISTS documents (
                    doc_id INT AUTO_INCREMENT PRIMARY KEY,
                    file_name VARCHAR(255) NOT NULL,
                    file_url VARCHAR(512) NOT NULL,
                    file_id VARCHAR(255) NOT NULL,
                    file_type VARCHAR(100),
                    file_size BIGINT,
                    uploaded_by INT NOT NULL,
                    uploader_role VARCHAR(20) NOT NULL,
                    group_id INT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("Created documents table (or already exists)");
        } catch (e) {
            console.error("Error creating documents table:", e.message);
        }

        await connection.end();
        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

addPhoneColumn();
