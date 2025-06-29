require("dotenv").config();
const mysql = require("mysql2/promise");
const { URL } = require("url");

let db;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL manually
  const dbUrl = new URL(process.env.DATABASE_URL);

  db = mysql.createPool({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace("/", ""), // remove leading slash
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  // Local development fallback
  db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
  });
}

// Test DB connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err.message);
  }
})();

module.exports = db;
