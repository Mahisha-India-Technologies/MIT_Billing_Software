import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Box,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  TableSortLabel,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import InvoicePreviewModal from "./PreviewModal.jsx";
import SearchIcon from "@mui/icons-material/Search";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import search_logo from "../../assets/images/logo2.svg";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { generateInvoiceListPDF } from "../../components/PDFGeneration/DownloadInvoiceList.jsx";
import { Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import API_BASE_URL from "../../Context/Api.jsx";

dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

function PartyMaster() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const [searchTerm, setSearchTerm] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [transportFilter, setTransportFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const theme = useTheme();
  const { palette } = theme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const primaryColor = palette.primary.main;
  const isDark = theme.palette.mode === "dark";

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/invoices/get-invoice`
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setInvoices(data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const safeFormat = (value, prefix = "") => {
    const num = Number(value);
    return isNaN(num) ? `${prefix}0.00` : `${prefix}${num.toFixed(2)}`;
  };

  const handlePreviewOpen = (invoice) => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      setSnackbarMessage("Please login first to preview invoice.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setSelectedInvoice(null);
    setPreviewOpen(false);
  };

  const handleDownloadPDF = () => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      setSnackbarMessage("Please login first to download invoice list.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Call your existing PDF generator
    generateInvoiceListPDF(filteredInvoices);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const matchesSearch =
          (inv.customer_name?.toLowerCase().includes(term) ?? false) ||
          (inv.invoice_number?.toLowerCase().includes(term) ?? false) ||
          (inv.customer_mobile?.toLowerCase().includes(term) ?? false) ||
          (inv.invoice_date?.toLowerCase().includes(term) ?? false) ||
          (inv.gst_number?.toLowerCase().includes(term) ?? false) ||
          (String(inv.total_amount)?.toLowerCase().includes(term) ?? false);
        if (!matchesSearch) return false;
      }

      if (
        discountFilter === "yes" &&
        (!inv.discount_value || Number(inv.discount_value) === 0)
      ) {
        return false;
      }
      if (
        discountFilter === "no" &&
        inv.discount_value &&
        Number(inv.discount_value) !== 0
      ) {
        return false;
      }

      if (
        transportFilter === "yes" &&
        (!inv.transport_charge || Number(inv.transport_charge) === 0)
      ) {
        return false;
      }
      if (
        transportFilter === "no" &&
        inv.transport_charge &&
        Number(inv.transport_charge) !== 0
      ) {
        return false;
      }

      if (startDate) {
        const invoiceDate = new Date(inv.invoice_date);
        const start = new Date(startDate);
        if (invoiceDate < start) return false;
      }
      if (endDate) {
        const invoiceDate = new Date(inv.invoice_date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (invoiceDate > end) return false;
      }

      return true;
    });
  }, [
    invoices,
    searchTerm,
    discountFilter,
    transportFilter,
    startDate,
    endDate,
  ]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort invoices by date (latest first)
  // Sort invoices by full datetime using created_at (latest first)

  // Paginated invoices

  // Handlers
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Handle header click
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // Sorted invoices
  const searchedAndFilteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        const matchesSearch =
          (String(inv.invoice_id)?.toLowerCase().includes(term) ?? false) ||
          (inv.customer_name?.toLowerCase().includes(term) ?? false) ||
          (inv.invoice_number?.toLowerCase().includes(term) ?? false) ||
          (inv.customer_mobile?.toLowerCase().includes(term) ?? false) ||
          (String(inv.invoice_date)?.toLowerCase().includes(term) ?? false) ||
          (inv.gst_number?.toLowerCase().includes(term) ?? false) ||
          (String(inv.total_amount)?.toLowerCase().includes(term) ?? false) ||
          (String(inv.discount_value)?.toLowerCase().includes(term) ?? false) ||
          (String(inv.transport_charge)?.toLowerCase().includes(term) ?? false);
        if (!matchesSearch) return false;
      }

      if (
        discountFilter === "yes" &&
        (!inv.discount_value || Number(inv.discount_value) === 0)
      )
        return false;
      if (
        discountFilter === "no" &&
        inv.discount_value &&
        Number(inv.discount_value) !== 0
      )
        return false;

      if (
        transportFilter === "yes" &&
        (!inv.transport_charge || Number(inv.transport_charge) === 0)
      )
        return false;
      if (
        transportFilter === "no" &&
        inv.transport_charge &&
        Number(inv.transport_charge) !== 0
      )
        return false;

      if (startDate) {
        const invoiceDate = new Date(inv.invoice_date);
        const start = new Date(startDate);
        if (invoiceDate < start) return false;
      }
      if (endDate) {
        const invoiceDate = new Date(inv.invoice_date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (invoiceDate > end) return false;
      }

      return true;
    });
  }, [
    invoices,
    searchTerm,
    discountFilter,
    transportFilter,
    startDate,
    endDate,
  ]);

  // Use this instead of invoices in sortedInvoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...searchedAndFilteredInvoices];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === "created_at") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [searchedAndFilteredInvoices, sortConfig]);

  const paginatedInvoices = sortedInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
        color: theme.palette.text.primary,
        minHeight: "100vh",
        padding: isMobile ? "1rem" : "2rem",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden", // ✅ Stop global horizontal overflow
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontSize: { xs: "20px", sm: "26px" },
          color: theme.palette.primary.main,
          fontWeight: "bold",
          pt: { xs: 3, sm: 1 },
          pb: { xs: 2, sm: 3 },
        }}
      >
        Party Master - Invoice Details
      </Typography>

      {/* Search bar & filter toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.background.paper,
            borderRadius: 8,
            boxShadow: `0 0 10px ${primaryColor}66`,
            border: `2px solid ${primaryColor}`,
            px: 2,
            py: { xs: 0.5, sm: 1 },
            width: isMobile ? "100%" : "70%",
            maxWidth: 700,
            "&:hover": {
              boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
              filter: "brightness(1.1)",
              transform: "scale(1.02)",
              transition: "all 0.3s ease",
            },
          }}
        >
          <SearchIcon sx={{ ml: 1, color: theme.palette.primary.main }} />
          <TextField
            placeholder="Search by Name, ID, HSN, etc..."
            variant="standard"
            fullWidth
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: { xs: "0.9rem", sm: "0.95rem" }, pl: 1 },
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CloseIcon
            onClick={() => setSearchTerm("")}
            sx={{ ml: 1, color: "gray", fontSize: "20px", cursor: "pointer" }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
          mt: 2, // optional spacing from top
          pr: 3, // optional padding on the right
          mb: 2,
          gap: "6px",
        }}
      >
        <Button
          onClick={handleDownloadPDF}
          variant="contained"
          sx={{
            gap: "8px",
            textTransform: "none",
            color: primaryColor,
            border: `1px solid ${primaryColor}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            transition: "all 0.3s ease-in-out",
            fontWeight: "bold",
            "&:hover": {
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
            },
          }}
        >
          <CloudDownloadIcon sx={{ fontSize: "20px", fontWeight: "bold" }} />
          Download PDF
        </Button>
        <Tooltip title="Toggle Invoice Filter" arrow>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              ml: 1,
              border: `1px solid ${primaryColor}`,
              "&:hover": {
                borderColor: primaryColor,
                boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
              },
            }}
          >
            <FilterListRoundedIcon
              sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filter panel */}
      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <Paper
          elevation={4}
          sx={{
            mx: "auto",
            px: 3,
            py: 2,
            mb: 2,
            borderRadius: 4,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(145deg, #1e1e1e, #2a2a2a)"
                : "linear-gradient(145deg, #ffffff, #f0f0f0)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 15px rgba(0,0,0,0.6)"
                : "0 4px 15px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            Advanced Filters
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mt: 2 }}>
            {/* Discount Filter */}
            <Box>
              <Typography fontWeight={600} mb={1}>
                Discount Status
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["all", "yes", "no"].map((val) => (
                  <Button
                    key={val}
                    variant={discountFilter === val ? "contained" : "outlined"}
                    color={discountFilter === val ? "primary" : "inherit"}
                    size="small"
                    sx={{
                      borderRadius: 5,
                      px: 3,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                    onClick={() => setDiscountFilter(val)}
                  >
                    {val === "all"
                      ? "All"
                      : val === "yes"
                      ? "Given"
                      : "Not Given"}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Transport Filter */}
            <Box>
              <Typography fontWeight={600} mb={1}>
                Transport Charge
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["all", "yes", "no"].map((val) => (
                  <Button
                    key={val}
                    variant={transportFilter === val ? "contained" : "outlined"}
                    color={transportFilter === val ? "primary" : "inherit"}
                    size="small"
                    sx={{
                      borderRadius: 5,
                      px: 3,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                    onClick={() => setTransportFilter(val)}
                  >
                    {val === "all"
                      ? "All"
                      : val === "yes"
                      ? "Applied"
                      : "Not Applied"}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Date Range Filter */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={600} mb={1}>
                Date Range
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  sx={{
                    borderRadius: 5,
                    px: 3,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    color: primaryColor,
                    border: `1px solid ${primaryColor}`,
                    mt: 0.5,
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Invoice table */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            maxWidth: "100vw",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <TableContainer
            sx={{
              border: `2px solid ${primaryColor}`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${primaryColor}66`,
            }}
          >
            <Table size="small" sx={{ minWidth: 1200, width: "100%" }}>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: isDark ? "#121212" : "#f4f4f4" }}
                >
                  <TableCell
                    sx={{
                      color: primaryColor,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      py: 2.2,
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: "bold" }}>
                    Invoice No
                  </TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: "bold" }}>
                    Customer GST No
                  </TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: "bold" }}>
                    Customer Name
                  </TableCell>

                  {/* Sortable Discount */}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: primaryColor }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === "discount_value"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("discount_value")}
                    >
                      Discount
                    </TableSortLabel>
                  </TableCell>

                  {/* Sortable Transport */}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: primaryColor }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === "transport_charge"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("transport_charge")}
                    >
                      Transport
                    </TableSortLabel>
                  </TableCell>

                  {/* Sortable Date */}
                  <TableCell sx={{ fontWeight: "bold", color: primaryColor }}>
                    <TableSortLabel
                      active={sortConfig.key === "created_at"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("created_at")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>

                  {/* Sortable Total Amount */}
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: primaryColor }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === "total_amount"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("total_amount")}
                    >
                      Total Amount
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sx={{ color: primaryColor, fontWeight: "bold" }}>
                    Preview
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((inv, index) => (
                    <TableRow
                      key={inv.invoice_id}
                      hover
                      sx={{
                        transition: "all 0.2s",
                        backgroundColor: isDark ? "black" : "white",
                        "&:hover": {
                          backgroundColor: isDark ? "#2a2a2a" : "#f9f9f9",
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {inv.invoice_id}
                      </TableCell>
                      <TableCell>{inv.invoice_number || "N/A"}</TableCell>
                      <TableCell>{inv.gst_number || "N/A"}</TableCell>
                      <TableCell>{inv.customer_name || "Anonymous"}</TableCell>
                      <TableCell align="right">
                        ₹ {safeFormat(inv.discount_value)}
                      </TableCell>
                      <TableCell align="right">
                        ₹ {safeFormat(inv.transport_charge)}
                      </TableCell>
                      <TableCell>
                        {inv.created_at
                          ? dayjs(inv.created_at)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY - hh:mm A")
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: primaryColor }}
                      >
                        ₹ {safeFormat(inv.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Preview">
                          <IconButton
                            onClick={() => handlePreviewOpen(inv)}
                            sx={{
                              borderRadius: "50%",
                              border: `1px solid ${primaryColor}`,
                              color: primaryColor,
                              "&:hover": {
                                boxShadow: `0 0 8px ${primaryColor}`,
                              },
                            }}
                          >
                            <TrackChangesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={sortedInvoices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                px: 2,
                backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9",
                color: isDark ? "#fff" : "#000",
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.85rem",
                  },
              }}
            />
          </TableContainer>
        </Box>
      )}

      {/* Modal */}
      <InvoicePreviewModal
        open={previewOpen}
        onClose={handlePreviewClose}
        invoice={selectedInvoice}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PartyMaster;
