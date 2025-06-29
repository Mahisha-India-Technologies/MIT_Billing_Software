import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import search_logo from "../../assets/images/logo2.svg";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import API_BASE_URL from "../../Context/Api";

export default function SelectProductsModal({
  open,
  onClose,
  onAddProducts,
  selectedProducts,
  setSelectedProducts,
  onQuantityChange,
}) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const primaryColor = theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    if (open) fetchProducts();
  }, [open]);

  const handleModalQuantityInputChange = (productId, value) => {
    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity < 0) return;

    setSelectedProducts((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;

      const rate = existing.rate ?? 0;
      const gst = existing.gst ?? 0;
      const discount = existing.discount ?? 0;

      const effectiveRate = rate;
      const amount = quantity * effectiveRate;
      const priceIncludingGst = amount * (1 + gst / 100);

      return {
        ...prev,
        [productId]: {
          ...existing,
          quantity,
          amount: amount.toFixed(2),
          priceIncludingGst: priceIncludingGst.toFixed(2),
        },
      };
    });

    // ❌ No onQuantityChange call here
  };

  const handleCheckboxChange = (productId, product) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev };

      if (updated[productId]) {
        delete updated[productId];
      } else {
        const rate = product.price;
        const gst = product.gst;
        const discount = product.discount ?? 0;
        const quantity = 1;
        const effectiveRate = rate * (1 - discount / 100);
        const amount = quantity * effectiveRate;
        const priceIncludingGst = amount * (1 + gst / 100);

        updated[productId] = {
          ...product,
          rate: effectiveRate,
          gst,
          discount,
          quantity,
          amount: amount.toFixed(2),
          priceIncludingGst: priceIncludingGst.toFixed(2),
        };
      }

      return updated;
    });
  };

  const filtered = products.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(search) ||
      p.product_id.toString().includes(search) ||
      p.hsn_code.toString().includes(search) ||
      p.price.toString().includes(search) ||
      p.category_name?.toLowerCase().includes(search) ||
      p.stock_quantity.toString().includes(search) ||
      p.discount?.toLowerCase().includes(search)
    );
  });

  const handleAdd = () => {
    onAddProducts(selectedProducts);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: 1000,
          height: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${primaryColor}`,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "transparent",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: primaryColor }}
          >
            Select Products
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: isDark ? "#ccc" : "#333" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* SEARCH BAR */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: isDark ? "#2b2b2b" : "#fff",
              borderRadius: 2,
              border: `1px solid ${isDark ? "#555" : "#ccc"}`,
              px: 1.5,
              py: 1,
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
              "&:focus-within": {
                boxShadow: `0 0 0 1px ${primaryColor}`,
              },
            }}
          >
            <SearchIcon
              sx={{ ml: 1, color: primaryColor, fontSize: "26px", mr: 2 }}
            />
            <TextField
              placeholder="Search by Name, ID, HSN, etc..."
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "0.95rem",
                  pl: 1,
                  color: isDark ? "#eee" : "#111",
                },
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CloseIcon
              sx={{
                ml: 1,
                color: "gray",
                fontSize: "20px",
                mr: 2,
                cursor: "pointer",
              }}
              onClick={() => setSearchTerm("")}
            />
          </Box>
        </Box>

        {/* TABLE */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 4,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow
                sx={{ backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5" }}
              >
                {[
                  "Select",
                  "Product Name",
                  "ID",
                  "HSN",
                  "Price",
                  "GST %",
                  "Discount %",
                  "Stock",
                  "Qty",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ color: primaryColor, fontWeight: "bold" }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product.product_id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: isDark ? "#333" : "#f9f9f9",
                    },
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={!!selectedProducts[product.product_id]}
                      onChange={() =>
                        handleCheckboxChange(product.product_id, product)
                      }
                      sx={{ color: primaryColor }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {product.product_name}
                  </TableCell>
                  <TableCell>{product.product_id}</TableCell>
                  <TableCell>{product.hsn_code}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.gst}%</TableCell>
                  <TableCell>{product.discount}%</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${isDark ? "#555" : "#ccc"}`,
                        borderRadius: "6px",
                        width: 100,
                        height: 36,
                        px: 1,
                        backgroundColor: isDark ? "#2b2b2b" : "#f9f9f9",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleModalQuantityInputChange(
                            product.product_id,
                            (selectedProducts[product.product_id]?.quantity ||
                              0) - 1
                          )
                        }
                        disabled={
                          !selectedProducts[product.product_id] ||
                          selectedProducts[product.product_id]?.quantity <= 0
                        }
                        sx={{ p: 0.5 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>

                      <Typography
                        variant="body2"
                        sx={{
                          mx: 1.5,
                          width: 20,
                          textAlign: "center",
                          fontWeight: 500,
                          color: isDark ? "#fff" : "#000",
                        }}
                      >
                        {selectedProducts[product.product_id]?.quantity ?? 0}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() =>
                          handleModalQuantityInputChange(
                            product.product_id,
                            (selectedProducts[product.product_id]?.quantity ||
                              0) + 1
                          )
                        }
                        disabled={!selectedProducts[product.product_id]}
                        sx={{ p: 0.5 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            borderTop: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
            px: 3,
            py: 2,
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
          }}
        >
          <Button
            onClick={handleAdd}
            variant="contained"
            color="primary"
            disabled={Object.keys(selectedProducts).length === 0}
            sx={{
              px: 2.5,
              py: 1.3,
              fontWeight: "bold",
              fontSize: "0.95rem",
              borderRadius: "8px",
              boxShadow: 3,
              textTransform: "none",
            }}
          >
            Add Selected Products
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
