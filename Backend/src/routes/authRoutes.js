const express = require("express");
const router = express.Router();
const db = require("../config/config.js");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key"; // ⚠️ In production, move to .env

router.post("/login", async (req, res) => {
  const { first_name, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE first_name = ? AND status = "active"',
      [first_name]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Note: In production, use bcrypt.compare()
    if (password !== user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token valid for 22 hours
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        first_name: user.first_name,
      },
      secretKey,
      { expiresIn: "22h" } // 🔒 Auto logout after 22 hours
    );

    // Decode token to get expiry (optional)
    const decoded = jwt.decode(token);

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.first_name,
        role: user.role,
        tokenExpiry: decoded.exp, // 👈 Send expiry to frontend (in seconds)
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
