const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./src/config/config.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS for frontend
app.use(cors({
  origin: "https://mit-billingsoftware.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ✅ JSON parsing middleware
app.use(express.json());

// ✅ Static file serving
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/invoices", express.static(path.join(__dirname, "public", "invoices")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
const productRoutes = require("./src/routes/products.js");
const authRoutes = require("./src/routes/authRoutes.js");
const invoiceRoutes = require("./src/routes/invoices.js");
const gstReportsRoutes = require("./src/routes/gstReports.js");
const usersRoutes = require("./src/routes/addUserRoutes.js");
const companyInfoRoutes = require("./src/routes/companyInfoRoutes.js");

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/gst-reports", gstReportsRoutes);
app.use("/api/company", companyInfoRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Billing API is running");
});

// ✅ Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send("Not Found - " + req.originalUrl);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
