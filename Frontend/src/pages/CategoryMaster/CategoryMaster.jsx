import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import axios from "axios";
import API_BASE_URL from "../../Context/Api";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddLinkIcon from "@mui/icons-material/AddLink";
import AutoModeIcon from '@mui/icons-material/AutoMode';

const CategoryMaster = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;
  const { palette } = theme;

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [isActive, setIsActive] = useState("Active");
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      showSnackbar("Category name is required", "error");
      return;
    }

    const data = {
      category_name: categoryName,
      is_active: isActive === "Active" ? 1 : 0,
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/categories/edit/${editingId}`,
          data
        );
        showSnackbar("Category updated successfully", "success");
      } else {
        await axios.post(`${API_BASE_URL}/api/categories/add`, data);
        showSnackbar("Category added successfully", "success");
      }

      setCategoryName("");
      setIsActive("Active");
      setEditingId(null);
      setOpenDialog(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong";
      showSnackbar(msg, "error");
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.category_name);
    setIsActive(category.is_active ? "Active" : "Inactive");
    setEditingId(category.category_id);
    setOpenDialog(true);
  };

  const formatDateTime = (iso) => {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} - ${hours}:${minutes} ${ampm}`;
  };

const filteredCategories = categories.filter((cat) => {
  const lowerSearch = searchTerm.trim().toLowerCase();

  const nameMatch = cat.category_name.toLowerCase().includes(lowerSearch);

  const statusText = cat.is_active ? "active" : "inactive";
  const statusMatch = statusText.toLowerCase().includes(lowerSearch);

  const dateStr = formatDateTime(cat.created_at).toLowerCase();
  const dateMatch = dateStr.includes(lowerSearch);

  const idMatch = String(cat.category_id).includes(lowerSearch);

  return nameMatch || statusMatch || dateMatch || idMatch;
});

  return (
    <Box p={isMobile ? 1 : 2} sx={{ mt: { xs: 4, sm: 3 } }}>
      <Box sx={{}}>
        <Typography
          variant="h5"
          sx={{ color: primaryColor, fontWeight: "bold" }}
        >
          Category Master
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          mb: 2,
          mt: { xs: 3, sm: 4 },
          gap: "8px",
          alignItems: 'center',
        }}
      >
        {/* Search bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: palette.background.paper,
              borderRadius: "40px",
              p: "6px 16px",
              width: "100%",
              maxWidth: "400px",
              minWidth: '300px',
              boxShadow: `0 0 10px ${primaryColor}66`,
              border: `2px solid ${primaryColor}`,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
              },
            }}
          >
            <SearchIcon sx={{ color: primaryColor }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for the User..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: palette.text.primary,
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <CloseIcon
              onClick={() => setSearchTerm("")}
              sx={{ color: "gray", fontSize: "20px", cursor: "pointer" }}
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={() => {
            setCategoryName("");
            setIsActive("Active");
            setEditingId(null);
            setOpenDialog(true);
          }}
          sx={{
            gap: "8px",
            textTransform: "none",
            color: primaryColor,
            border: `2px solid ${primaryColor}`,
            borderRadius: "10px",
            backgroundColor: "transparent",
            transition: "all 0.3s ease-in-out",
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "200px",
            "&:hover": {
              boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
              filter: "brightness(1.1)",
              transform: "scale(1.01)",
            },
          }}
        >
          <AddLinkIcon />
          Add New Category
        </Button>
      </Box>

      {/* Styled Table Layout */}
      <Box
        sx={{
          width: "100%",
          mt: 2,
          overflowX: "auto",
          maxWidth: "100vw",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            border: `2px solid ${primaryColor}`,
            borderRadius: 2,
            boxShadow: `0 0 8px ${primaryColor}66`,
          }}
        >
          <Table size="small" sx={{ minWidth: 800, width: "100%" }}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
                }}
              >
                {[
                  "S.No",
                  "Category Name",
                  "Category ID",
                  "Status",
                  "Created At",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: primaryColor,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      py: 2.2,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.category_id} hover>
                    <TableCell sx={{ fontWeight: "bold", width: '40px', textAlign: 'center' }}>
                      {index + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {category.category_name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {category.category_id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {category.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {formatDateTime(category.created_at)}
                    </TableCell>
                    <TableCell align="left">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(category)}
                        sx={{
                          borderRadius: "50%",
                          border: `1px solid ${primaryColor}`,
                          "&:hover": {
                            boxShadow: `0 0 8px ${primaryColor}`,
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog */}
      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${primaryColor}`,
    boxShadow: `0 0 10px ${primaryColor}`,
    borderRadius: 3,
    },
  }}
>
  <DialogTitle
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    bgcolor: palette.background.default,
    color: primaryColor,
    fontWeight: 'bold',
  }}
>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <AutoModeIcon /> {/* Replace with your preferred icon */}
    {editingId ? "Edit Category" : "Add Category"}
  </Box>
  <IconButton onClick={() => setOpenDialog(false)} edge="end">
    <CloseIcon />
  </IconButton>
</DialogTitle>

  <DialogContent
    dividers
    sx={{
      overflowY: 'auto',
      flex: 1,
      bgcolor: palette.background.paper,
    }}
  >
    <TextField
      label="Category Name"
      fullWidth
      value={categoryName}
      onChange={(e) => setCategoryName(e.target.value)}
      sx={{ mt: 2 }}
    />
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Status</InputLabel>
      <Select
        label="Status"
        value={isActive}
        onChange={(e) => setIsActive(e.target.value)}
      >
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Inactive">Inactive</MenuItem>
      </Select>
    </FormControl>
  </DialogContent>

  <DialogActions
    sx={{
      position: 'sticky',
      bottom: 0,
      bgcolor: palette.background.default,
    }}
  >
    <Button variant="outlined" onClick={handleSubmit}
    sx={{
              gap: "8px",
              textTransform: "none",
              color: primaryColor,
              border: `2px solid ${primaryColor}`,
              borderRadius: "10px",
              backgroundColor: "transparent",
              transition: "all 0.3s ease-in-out",
              fontWeight: "bold",
              textAlign: "center",
              "&:hover": {
                boxShadow: `0 0 8px ${primaryColor}, 0 0 6px ${primaryColor}`,
                filter: "brightness(1.1)",
                transform: "scale(1.01)",
              },
            }}
    >
      {editingId ? "Update Category" : "Add Category"}
    </Button>
  </DialogActions>
</Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryMaster;
