import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Divider,
  useTheme,
  IconButton,
  Grid,
  TableContainer,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { generateInvoicePDF } from "../../components/PDFGeneration/DownloadInvoice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

function InvoicePreviewModal({ open, onClose, invoice }) {
  const theme = useTheme();
  const themeColor = theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";
  dayjs.extend(utc);
  dayjs.extend(timezone);

  if (!invoice) return null;

  const formatCurrency = (val) => {
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          borderRadius: 3,
          border: `1px solid ${themeColor}`,
          boxShadow: `0 0 10px ${themeColor}`,
          width: { xs: "95%", sm: "90%", md: "85%", lg: "auto", },
          margin: "auto", 
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: isDark ? "#000" : "#fafcfa",
          color: themeColor,
          fontWeight: 600,
          fontSize: 20,
          px: 3,
          py: 2,
        }}
      >
        Invoice Preview - {invoice.invoice_number || "N/A"}
        <IconButton onClick={onClose} color="info">
          <CloseIcon sx={{ color: themeColor }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          maxHeight: "75vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          backgroundColor: isDark ? "#000" : "white",
        }}
      >
        {/* Customer Info */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: themeColor,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: "bold",
          }}
        >
          👤 Customer Information
        </Typography>

        <Box
          sx={{
            border: `1px solid ${themeColor}`,
            borderRadius: "10px",
            backgroundColor: theme.palette.background.paper,
            p: { xs: 2, sm: 3 },
            mb: 3,
          }}
        >
          {/* Name & Mobile */}
          <Grid
            container
            spacing={2}
            mb={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: themeColor }}>
                <strong>Name :</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 900,
                  }}
                >
                  {invoice.customer_name || "-"}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: themeColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Mobile :{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 900,
                  }}
                >
                  {invoice.customer_mobile || "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>

          {/* Address */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: themeColor, fontWeight: "bold", mb: 0.5 }}
            >
              Address :
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? "#cfd3d3" : "#3e3e3e",
                whiteSpace: "pre-line",
                pl: 1,
              }}
            >
              {[invoice.address, invoice.state, invoice.pincode]
                .filter(Boolean)
                .join(", ") || "-"}
            </Typography>
          </Box>

          {/* GST & Invoice No. */}
          <Grid
            container
            spacing={2}
            mb={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: themeColor }}>
                <strong>GST No. :</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 500,
                  }}
                >
                  {invoice.gst_number || "-"}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: themeColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Invoice No. :{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 500,
                  }}
                >
                  {invoice.invoice_number || "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>

          {/* Place of Supply & Vehicle No. */}
          <Grid
            container
            spacing={2}
            mb={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ color: themeColor }}>
                <strong>Place of Supply :</strong>{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 500,
                  }}
                >
                  {invoice.place_of_supply || "-"}
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                variant="body2"
                sx={{
                  color: themeColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "center" },
                }}
              >
                Vehicle No. :{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 500,
                  }}
                >
                  {invoice.vehicle_number || "-"}
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                variant="body2"
                sx={{
                  color: themeColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Date :{" "}
                <Box
                  component="span"
                  sx={{
                    color: isDark ? "#cfd3d3" : "#3e3e3e",
                    fontWeight: 500,
                  }}
                >
                  {invoice.created_at
                    ? dayjs
                        .utc(invoice.created_at)
                        .tz("Asia/Kolkata")
                        .format("DD-MM-YYYY - hh:mm A")
                    : "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, borderColor: themeColor }} />

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: themeColor,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: "bold",
          }}
        >
          📦 Product Details
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#000",
              mb: 2,
              border: `1px solid ${themeColor}`,
              minWidth: "800px",
              borderRadius: "10px",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: theme.palette.background.default }}
                >
                  {[
                    "Product",
                    "HSN",
                    "Qty",
                    "Unit",
                    "Rate",
                    "GST%",
                    "Discount",
                    "Base Amt",
                    "Total (incl GST)",
                    "Description",
                    "Category",
                  ].map((head, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        color: themeColor,
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <TableRow
                      key={item.item_id || index}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                      }}
                    >
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.product_name || "-"}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.hsn_code || "-"}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.unit || "-"}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDark ? "#fff" : "#424242" }}
                      >
                        ₹{formatCurrency(item.rate)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDark ? "#fff" : "#424242" }}
                      >
                        {item.gst_percentage || 0}%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDark ? "#fff" : "#424242" }}
                      >
                        {item.discount || 0}%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDark ? "#fff" : "#424242" }}
                      >
                        ₹{formatCurrency(item.base_amount)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: isDark ? "#fff" : "#424242",
                          fontWeight: "bold",
                        }}
                      >
                        ₹{formatCurrency(item.total_with_gst)}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.product_description || "-"}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? "#fff" : "#424242" }}>
                        {item.category_name || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      sx={{ textAlign: "center", color: "#aaa" }}
                    >
                      Please select product(s) to display details.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3, borderColor: themeColor }} />

        {/* Summary */}
        <Box>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              color: themeColor,
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              mb: 1,
              letterSpacing: 1,
            }}
          >
            Bill Summary
          </Typography>

          <Grid
            container
            spacing={3}
            sx={{
              borderRadius: "10px",
              border: `1px solid ${themeColor}`,
              p: 3,
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              justifyContent: "space-between",
            }}
          >
            {/* LEFT COLUMN */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ color: "#ccc" }}>
                {[
                  {
                    label: "Subtotal (Without GST)",
                    value: `₹${formatCurrency(invoice.subtotal)}`,
                  },
                  {
                    label: `Discount in (${
                      invoice.discount_type === "%" ? `%` : `₹`
                    })`,
                    value: `₹${formatCurrency(invoice.discount_value)}`,
                  },
                  invoice.transport_charge > 0 && {
                    label: "Transport Charges",
                    value: `₹${formatCurrency(invoice.transport_charge)}`,
                  },
                  {
                    label: "Total with Product GST",
                    value: `₹${formatCurrency(invoice.total_amount)}`,
                  },
                ]
                  .filter(Boolean)
                  .map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.4,
                      }}
                    >
                      <Typography
                        fontSize="1rem"
                        color="text.secondary"
                        sx={{ flex: 1 }}
                      >
                        {item.label} :
                      </Typography>
                      <Typography
                        fontWeight={600}
                        fontSize="1.05rem"
                        sx={{
                          color: isDark ? "white" : "#303030",
                          minWidth: "150px",
                          textAlign: "right",
                          fontSize: "16px",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </Grid>

            {/* RIGHT COLUMN – GST DETAILS */}
            {invoice.gst_amount > 0 && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ color: "#ccc" }}>
                  {[
                    {
                      label: `GST (${invoice.gst_percentage}%)`,
                      value: `₹${formatCurrency(invoice.gst_amount)}`,
                    },
                    {
                      label: `CGST (${(invoice.gst_percentage / 2).toFixed(2)}%)`,
                      value: `₹${formatCurrency(invoice.cgst_amount)}`,
                    },
                    {
                      label: `SGST (${(invoice.gst_percentage / 2).toFixed(2)}%)`,
                      value: `₹${formatCurrency(invoice.sgst_amount)}`,
                    },
                    {
                      label: "Total GST Value",
                      value: `₹${formatCurrency(invoice.gst_amount)}`,
                    },
                  ].map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.4,
                      }}
                    >
                      <Typography
                        fontSize="1rem"
                        color="text.secondary"
                        sx={{ flex: 1 }}
                      >
                        {item.label} :
                      </Typography>
                      <Typography
                        fontWeight={600}
                        fontSize="1.05rem"
                        sx={{
                          color: isDark ? "white" : "#303030",
                          minWidth: "150px",
                          textAlign: "right",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3, borderColor: themeColor }} />

          {/* GRAND TOTAL */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2, px: 1 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: themeColor,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              Grand Total:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: themeColor,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              ₹{formatCurrency(invoice.total_amount)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, backgroundColor: isDark ? "#000" : "#fafcfa" }}
      >
        <Button
          onClick={onClose}
          sx={{
            ml: "10px",
            gap: "8px",
            textTransform: "none",
            color: isDark ? "#d1cfce" : "gray",
            border: isDark ? "1px solid #d1cfce" : "1px solid gray",
            borderRadius: "10px",
            backgroundColor: "transparent",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              borderColor: "red",
              color: "red",
            },
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => generateInvoicePDF(invoice)}
          variant="contained"
          sx={{
            ml: "10px",
            gap: "8px",
            textTransform: "none",
            color: themeColor,
            border: `1px solid ${themeColor}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            transition: "all 0.3s ease-in-out",
            fontWeight: "bold",
            "&:hover": {
              borderColor: themeColor,
              boxShadow: `0 0 8px ${themeColor}, 0 0 6px ${themeColor}`,
            },
          }}
        >
          <CloudDownloadIcon sx={{ fontSize: "20px", fontWeight: "bold" }} />
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Section({ title, children }) {
  return (
    <Box mb={2}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: "#90caf9",
          fontSize: "1.1rem",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function TwoColumn({ label, value, bold = false, color = "inherit" }) {
  return (
    <Typography sx={{ color }}>
      <strong style={{ fontWeight: bold ? 600 : 500 }}>{label}:</strong>{" "}
      <span style={{ fontWeight: bold ? 600 : 400 }}>{value || "N/A"}</span>
    </Typography>
  );
}

export default InvoicePreviewModal;
