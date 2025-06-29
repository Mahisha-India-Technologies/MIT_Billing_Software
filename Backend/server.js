// server.js
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/config.js");
const app = express();
const PORT = 5000;

const cors = require("cors");

app.use(cors({
  origin: "https://mit-billingsoftware.onrender.com", // ✅ allow your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(bodyParser.json());
const path = require("path");
const productRoutes = require("./src/routes/products.js");
const authRoutes = require("./src/routes/authRoutes.js");
const invoiceRoutes = require("./src/routes/invoices.js");
const gstReportsRoutes = require("./src/routes/gstReports.js");
const usersRoutes = require("./src/routes/addUserRoutes.js");
const companyInfoRoutes = require("./src/routes/companyInfoRoutes.js");

app.use((req, res, next) => {
  console.log(
    `[GLOBAL LOG] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(
  "/invoices",
  express.static(path.join(__dirname, "public", "invoices"))
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/gst-reports", gstReportsRoutes);
app.use("/api/company", companyInfoRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Billing API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
