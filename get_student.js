
const mysql = require("mysql2/promise");

async function getStudent() {
  const db = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "darshan12*123",
    database: "spms_db",
  });

  const [rows] = await db.query("SELECT username, password, role FROM login WHERE role = 'STUDENT' LIMIT 5");
  console.log(JSON.stringify(rows));
  await db.end();
}

getStudent().catch(console.error);
