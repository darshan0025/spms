const mysql = require('mysql2/promise');

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "darshan12*123",
  database: "spms_db",
};

async function testConnection() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connection successful!");
    
    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables in database:", tables.map(t => Object.values(t)[0]));
    
    // Check student table columns
    const [studentCols] = await connection.query("SHOW COLUMNS FROM student");
    console.log("Student columns:", studentCols.map(c => c.Field));

  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

testConnection();
