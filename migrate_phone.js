
const { db } = require("./app/lib/db");

async function addPhoneColumn() {
    try {
        console.log("Checking columns...");

        // Add column to staff table if missing
        try {
            await db.query("ALTER TABLE staff ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to staff table");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("phone_no already exists in staff table");
            } else {
                console.error("Error adding phone_no to staff:", e);
            }
        }

        // Add column to student table if missing
        try {
            await db.query("ALTER TABLE student ADD COLUMN phone_no VARCHAR(20)");
            console.log("Added phone_no to student table");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("phone_no already exists in student table");
            } else {
                console.error("Error adding phone_no to student:", e);
            }
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

addPhoneColumn();
