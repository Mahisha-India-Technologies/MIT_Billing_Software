const express = require("express");
const router = express.Router();
const db = require("../config/config.js"); // your DB connection
const bcrypt = require("bcrypt");

// POST /api/users
// backend/routes/users.js

router.post("/add-users", async (req, res) => {
  const {
    first_name,
    last_name,
    mobile_number,
    email,
    password,
    role,
    status,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !mobile_number ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = password; // Optionally hash using bcrypt

    const sql = `
      INSERT INTO users (
        first_name, last_name, mobile_number, email, password_hash, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      first_name,
      last_name,
      mobile_number,
      email,
      hashedPassword,
      role,
      status || "active",
    ]);

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Insert User Error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage.includes("mobile_number")) {
        return res.status(409).json({ message: "Mobile number already exists." });
      } else if (err.sqlMessage.includes("email")) {
        return res.status(409).json({ message: "Email already exists." });
      } else {
        return res.status(409).json({ message: "Duplicate entry." });
      }
    }

    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/all-users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// Backend: routes/users.js or similar
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the user has related invoices
    const [invoices] = await db.execute("SELECT * FROM invoices WHERE created_by = ?", [id]);

    if (invoices.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete user who has created invoices, instead try to make them inactive" });
    }

    const [result] = await db.execute("DELETE FROM users WHERE user_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

router.put("/update/:id", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    mobile_number,
    role,
    status,
    password, // optional plain text
  } = req.body;

  const { id } = req.params;

  try {
    // Build base update query and params
    let sql = `
      UPDATE users SET
        first_name = ?,
        last_name = ?,
        email = ?,
        mobile_number = ?,
        role = ?,
        status = ?
    `;
    const params = [
      first_name,
      last_name,
      email,
      mobile_number,
      role,
      status,
    ];

    // If password is provided, store it directly (NOT HASHED)
    if (password && password.trim() !== "") {
      sql += `, password_hash = ?`;
      params.push(password); // Storing plain text
    }

    sql += ` WHERE user_id = ?`;
    params.push(id);

    const [result] = await db.execute(sql, params);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
