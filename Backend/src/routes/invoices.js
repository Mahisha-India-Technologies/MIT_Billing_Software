const express = require("express");
const router = express.Router();
const db = require("../config/config.js");
const fs = require("fs");
const path = require("path");
const generateInvoicePDF = require("../utils/generatePdf.js");

router.post("/create", async (req, res) => {
  let connection;
  console.log("✅ Received request at /api/invoices/create");

  const sanitize = (val, def = null) => {
    if (val === undefined || val === null) return def;
    if (typeof val === "string" && val.trim() === "") return def;
    return val;
  };

  try {
    const { customer, products, summaryData, created_by } = req.body;

    if (!customer || !products?.length || !summaryData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required invoice data" });
    }

    const paymentType = sanitize(summaryData.paymentType, 'Cash');
    const advanceAmount = sanitize(summaryData.advanceAmount, 0);

    connection = await db.getConnection();
    await connection.beginTransaction();
    console.log("🔄 Transaction started");

    // 1. Check if customer exists or insert new
    let customer_id;
    const [existing] = await connection.execute(
      `SELECT customer_id FROM customers WHERE gst_number = ?`,
      [customer.gst || null]
    );

    if (existing.length > 0) {
      customer_id = existing[0].customer_id;
      console.log("✅ Existing customer:", customer_id);
    } else {
      const [result] = await connection.execute(
        `INSERT INTO customers 
          (name, mobile, gst_number, address, state, pincode, place_of_supply, vehicle_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitize(customer.name),
          sanitize(customer.mobile),
          sanitize(customer.gst),
          sanitize(customer.address),
          sanitize(customer.state),
          sanitize(customer.pincode),
          sanitize(customer.placeOfSupply),
          sanitize(customer.vehicleNo),
        ]
      );
      customer_id = result.insertId;
      console.log("✅ New customer added:", customer_id);
    }

    // 2. Insert invoice
    const [invoiceResult] = await connection.execute(
      `INSERT INTO invoices 
        (customer_id, invoice_number, invoice_date, place_of_supply, vehicle_number,
         subtotal, gst_percentage, gst_amount, cgst_amount, sgst_amount,
         discount_type, discount_value, transport_charge, total_amount, 
         payment_type, advance_amount, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        sanitize(customer.invoiceNo),
        sanitize(customer.date),
        sanitize(customer.placeOfSupply),
        sanitize(customer.vehicleNo),
        sanitize(summaryData.totalWithGst, 0),
        sanitize(summaryData.gst, 0),
        sanitize(summaryData.gstCost, 0),
        sanitize(summaryData.cgstCost, 0),
        sanitize(summaryData.sgstCost, 0),
        sanitize(summaryData.discountType, "%"),
        sanitize(summaryData.discountValue, 0),
        sanitize(summaryData.transportCharge, 0),
        sanitize(summaryData.total, 0),
        paymentType,
        advanceAmount,
        sanitize(created_by, 1),
      ]
    );

    const invoice_id = invoiceResult.insertId;
    console.log("✅ Invoice inserted:", invoice_id);

    // 3. Insert invoice items
    for (const p of products) {
      await connection.execute(
        `INSERT INTO invoice_items 
          (invoice_id, product_id, hsn_code, quantity, unit, rate, gst_percentage, base_amount, total_with_gst)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice_id,
          sanitize(p.product_id),
          sanitize(p.hsn_code),
          sanitize(p.quantity, 0),
          sanitize(p.unit),
          sanitize(p.rate, 0),
          sanitize(p.gst, 0),
          sanitize(p.amount, 0),
          sanitize(p.priceIncludingGst, 0),
        ]
      );
    }

    // 4. Update stock and log stock movements
    for (const p of products) {
      const [rows] = await connection.execute(
        `SELECT stock_quantity FROM products WHERE product_id = ? FOR UPDATE`,
        [p.product_id]
      );

      const currentStock = rows[0]?.stock_quantity ?? 0;
      const newStock = currentStock - p.quantity;

      if (newStock < 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `❌ Insufficient stock for product ID ${p.product_id}`,
        });
      }

      await connection.execute(
        `UPDATE products SET stock_quantity = ? WHERE product_id = ?`,
        [newStock, p.product_id]
      );

      await connection.execute(
        `INSERT INTO stock_movements 
          (product_id, change_type, quantity_changed, old_stock, new_stock, reason, reference_id, updated_by)
         VALUES (?, 'OUT', ?, ?, ?, ?, ?, ?)`,
        [
          p.product_id,
          p.quantity,
          currentStock,
          newStock,
          `Invoice #${sanitize(customer.invoiceNo)}`,
          invoice_id,
          String(created_by),
        ]
      );
    }

    // 5. Commit transaction
    await connection.commit();
    console.log("✅ Transaction committed");

    // 6. Ensure invoices directory exists
    const invoicesDir = path.join(__dirname, "..", "..", "public", "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
      console.log("📁 Created invoices directory");
    }

    // 7. Generate PDF
    const safeInvoiceNo = String(customer.invoiceNo).replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `invoice-${safeInvoiceNo}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    try {
      await generateInvoicePDF({ customer, products, summaryData }, filePath);
      console.log("📄 PDF generated:", filePath);

      return res.status(201).json({
        success: true,
        message: "Invoice created and PDF generated",
        pdfUrl: `/invoices/${fileName}`,
      });
    } catch (pdfErr) {
      console.error("❌ PDF generation error:", pdfErr);
      return res.status(201).json({
        success: true,
        message: "Invoice created but PDF generation failed",
        pdfError: pdfErr.message,
      });
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error in invoice creation:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    if (connection) connection.release();
    console.log("🔚 Connection released");
  }
});

router.get("/get-invoice", async (req, res) => {
  try {
    const [invoices] = await db.execute(`
      SELECT 
        i.*, 
        c.name AS customer_name, c.mobile AS customer_mobile, c.gst_number, 
        c.address, c.state, c.pincode, c.place_of_supply, c.vehicle_number,
        u.first_name AS created_by_first_name, u.last_name AS created_by_last_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN users u ON i.created_by = u.user_id
      ORDER BY i.created_at DESC
    `);

    const [items] = await db.execute(`
      SELECT 
        ii.*, 
        p.product_name, 
        p.description AS product_description, 
        p.image_url, 
        p.price AS product_price, 
        p.gst, 
        p.c_gst, 
        p.s_gst,
        p.discount,
        pc.category_name
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.product_id
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
    `);

    const itemsGroupedByInvoice = {};
    for (const item of items) {
      if (!itemsGroupedByInvoice[item.invoice_id]) {
        itemsGroupedByInvoice[item.invoice_id] = [];
      }
      itemsGroupedByInvoice[item.invoice_id].push(item);
    }

    const fullInvoices = invoices.map((invoice) => ({
      ...invoice,
      created_by_name: `${invoice.created_by_first_name} ${invoice.created_by_last_name}`,
      items: itemsGroupedByInvoice[invoice.invoice_id] || [],
    }));

    res.json(fullInvoices);
  } catch (err) {
    console.error("❌ Failed to fetch full invoice data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
