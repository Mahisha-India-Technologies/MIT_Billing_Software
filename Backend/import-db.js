require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

(async () => {
  try {
    console.log("📥 Importing SQL...");

    const sql = fs.readFileSync("./billing_software.sql", "utf-8");

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true, // ✅ Very important
    });

    await connection.query(sql);
    console.log("✅ SQL imported successfully!");
    await connection.end();
  } catch (err) {
    console.error("❌ Failed to import SQL file:", err.message);
  }
})();
