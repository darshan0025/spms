const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spms_db'
};

async function checkColumns() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [staffColumns] = await connection.query("SHOW COLUMNS FROM staff");
        const [studentColumns] = await connection.query("SHOW COLUMNS FROM student");
        const [memberColumns] = await connection.query("SHOW COLUMNS FROM project_group_member");

        console.log("Staff Columns:", staffColumns.map(c => c.Field));
        console.log("Student Columns:", studentColumns.map(c => c.Field));
        console.log("Member Columns:", memberColumns.map(c => c.Field));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (connection) await connection.end();
    }
}

checkColumns();
