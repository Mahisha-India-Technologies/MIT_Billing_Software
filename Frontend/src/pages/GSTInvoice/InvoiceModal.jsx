import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Divider,
  IconButton,
  Box,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GeneratingTokensIcon from "@mui/icons-material/GeneratingTokens";

const SlideUp = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InvoicePreviewModal({
  open,
  onClose,
  summaryData = {},
  customer = {},
  products = [],
  paymentType,
  advanceAmount,
  onSubmit,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary?.main || "#00bcd4"; // fallback if secondary missing
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const bgDefault = theme.palette.background.default;
  const paperBg = theme.palette.background.paper;

  const {
    subtotal = 0,
    totalWithGst = 0,
    gst = 0,
    gstCost = 0,
    cgstCost = 0,
    sgstCost = 0,
    discount = 0,
    discountValue = 0,
    discountType = "",
    transportAmount = 0,
    transportChecked = false,
    total = 0,
  } = summaryData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      fullScreen={isSmall}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          p: { xs: 1, sm: 2 },
          borderRadius: { xs: 0, sm: "16px" },
          background: isDark
            ? "linear-gradient(to right, rgb(11, 11, 11), rgb(7, 7, 7))"
            : paperBg,
          boxShadow: `0 0 10px ${primaryColor}`,
          color: textPrimary,
          border: `2px solid ${primaryColor}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: isDark ? secondaryColor : primaryColor,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "bold" }}
        >
          🧾 Invoice Summary Preview
        </Typography>
        <IconButton onClick={onClose} sx={{ color: primaryColor }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          mt: 1,
          overflowY: "auto",
          maxHeight: { xs: "85vh", sm: "80vh" },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          bgcolor: isDark ? "transparent" : bgDefault,
          color: textPrimary,
        }}
      >
        {/* Customer Info */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: primaryColor,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            fontWeight: "bold",
          }}
        >
          👤 Customer Information
        </Typography>

        <Box
          sx={{
            border: `1px solid ${primaryColor}`,
            borderRadius: "10px",
            backgroundColor: isDark ? "rgba(255 255 255 / 0.05)" : "#fff",
            p: { xs: 2, sm: 3 },
            mb: 3,
            color: textPrimary,
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
              <Typography variant="body2" sx={{ color: primaryColor }}>
                <strong>Name :</strong>{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.name || "-"}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Mobile :{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.mobile || "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>

          {/* Address */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: primaryColor, fontWeight: "bold", mb: 0.5 }}
            >
              Address :
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: textSecondary, whiteSpace: "pre-line", pl: 1 }}
            >
              {[customer.address, customer.state, customer.pincode]
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
              <Typography variant="body2" sx={{ color: primaryColor }}>
                <strong>GST No. :</strong>{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.gst || "-"}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Invoice No. :{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.invoiceNo || "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            mb={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: primaryColor }}>
                <strong>Payment Type :</strong>{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {paymentType || "-"}
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="body2"
                sx={{
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Advance Amount:{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {advanceAmount &&
                  !isNaN(advanceAmount) &&
                  Number(advanceAmount) > 0
                    ? `₹${advanceAmount}`
                    : "Not applicable"}
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
              <Typography variant="body2" sx={{ color: primaryColor }}>
                <strong>Place of Supply :</strong>{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.placeOfSupply || "-"}
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                variant="body2"
                sx={{
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "center" },
                }}
              >
                Vehicle No. :{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.vehicleNo || "-"}
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                variant="body2"
                sx={{
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                Date :{" "}
                <Box
                  component="span"
                  sx={{ color: textSecondary, fontWeight: 500 }}
                >
                  {customer.date || "-"}
                </Box>
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3, borderColor: primaryColor }} />

        {/* Product Table */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            color: primaryColor,
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
              backgroundColor: isDark ? "rgba(255 255 255 / 0.05)" : "#fff",
              mb: 2,
              border: `1px solid ${primaryColor}`,
              minWidth: "800px",
              borderRadius: "10px",
            }}
          >
            <Table size="small" sx={{ color: textPrimary }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: isDark
                      ? "rgba(255 255 255 / 0.1)"
                      : "#f5f5f5",
                  }}
                >
                  {[
                    "Product",
                    "HSN",
                    "Qty",
                    "Unit",
                    "Rate",
                    "GST%",
                    "Discount %",
                    "Base Amt",
                    "Total (incl GST)",
                  ].map((head, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        color: primaryColor,
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        borderBottom: `1px solid ${primaryColor}`,
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length > 0 ? (
                  products.map((p, i) => {
                    const gstPercent = parseFloat(p.gst || 0);
                    const baseAmount = parseFloat(p.amount || 0);
                    const gstAmount = (baseAmount * gstPercent) / 100;
                    const totalWithGst = baseAmount + gstAmount;

                    return (
                      <TableRow key={i} hover>
                        <TableCell sx={{ color: textPrimary }}>
                          {p.particular}
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {p.hsn_code}
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {p.quantity}
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {p.unit}
                        </TableCell>
                        <TableCell
                          sx={{ color: textPrimary, textAlign: "right" }}
                        >
                          ₹{p.rate}
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {gstPercent}%
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {p.discount}%
                        </TableCell>
                        <TableCell
                          sx={{ color: textPrimary, textAlign: "right" }}
                        >
                          ₹{baseAmount.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{ color: textPrimary, textAlign: "right" }}
                        >
                          ₹{totalWithGst.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{ textAlign: "center", color: textSecondary }}
                    >
                      Please select product(s) to display details.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Summary */}
        <Box>
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              color: primaryColor,
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
              border: `1px solid ${primaryColor}`,
              p: 3,
              width: "100%",
              backgroundColor: isDark ? "transparent" : "inherit",
              justifyContent: "space-between",
              color: textPrimary,
            }}
          >
            {/* LEFT COLUMN */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ color: textSecondary }}>
                {[
                  {
                    label: "Subtotal (Without GST)",
                    value: `₹${subtotal.toFixed(2)}`,
                  },
                  {
                    label: `Discount (${
                      discountType === "%" ? `${discount}%` : `₹${discount}`
                    })`,
                    value: `₹${discountValue.toFixed(2)}`,
                  },
                  transportChecked && {
                    label: "Transport Charges",
                    value: `₹${transportAmount.toFixed(2)}`,
                  },
                  {
                    label: "Total with Product GST",
                    value: `₹${(
                      totalWithGst -
                      discountValue +
                      transportAmount +
                      gstCost
                    ).toFixed(2)}`,
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
            {gst > 0 && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ color: textSecondary }}>
                  {[
                    {
                      label: `GST (${gst}%)`,
                      value: `₹${gstCost.toFixed(2)}`,
                    },
                    {
                      label: `CGST (${(gst / 2).toFixed(2)}%)`,
                      value: `₹${cgstCost.toFixed(2)}`,
                    },
                    {
                      label: `SGST (${(gst / 2).toFixed(2)}%)`,
                      value: `₹${sgstCost.toFixed(2)}`,
                    },
                    {
                      label: "Total GST Value",
                      value: `₹${(cgstCost + sgstCost).toFixed(2)}`,
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
                        sx={{ minWidth: "150px", textAlign: "right" }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3, borderColor: primaryColor }} />

          {/* GRAND TOTAL */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2, px: 1, color: secondaryColor }}
          >
            <Typography
              variant="h6"
              sx={{
                color: primaryColor,
                fontWeight: "bold",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              Grand Total:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: primaryColor,
                fontWeight: "bold",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              ₹{total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <Box
        sx={{
          borderTop: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
          px: 3,
          py: 1,
          backgroundColor: "transparent",
          display: "flex",
          justifyContent: { xs: "center", sm: "flex-end" },
        }}
      >
        <Button
          display="flex"
          gap={2}
          mb={2}
          onClick={onSubmit}
          sx={{
            ml: "10px",
            gap: "8px",
            fontWeight: "bold",
            mt: "10px",
            textTransform: "none",
            color: primaryColor,
            border: `2px solid ${primaryColor}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
            },
          }}
        >
          <GeneratingTokensIcon sx={{ fontSize: "20px", fontWeight: "bold" }} />
          <Typography sx={{ fontWeight: "bold" }}>Generate Invoice</Typography>
        </Button>
      </Box>
    </Dialog>
  );
}
