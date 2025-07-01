import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import Navbar from "../components/Navbar/Navbar";
import GstInvoice from "../pages/GSTInvoice/GstInvoice";
import Products from "../pages/Products/Products";
import PartyMaster from "../pages/PartyMaster/PartyMaster";
import Dashboard from "../pages/Dashboard/GSTReport";
import AddUsers from "../pages/AddUsers/AddUsers";
import LoginPage from "../components/Login/Login";
import Loader from "../components/Loader/Loader";
import CategoryMaster from "../pages/CategoryMaster/CategoryMaster";
import { useAuth } from "../Context/AuthContext";
import ProtectedRoute from "../Context/ProtectedRoutes";

const AppLayout = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  } = useAuth();

  const isXLarge = useMediaQuery("(min-width:1200px)");
  const isSmall = useMediaQuery("(max-width:600px)");
  const isMedium = useMediaQuery("(min-width:600px) and (max-width:1200px)");
  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState("permanent");

  React.useEffect(() => {
    if (isSmall) {
      setVariant("temporary");
      setOpen(false);
    } else if (isXLarge) {
      setVariant("permanent");
      setOpen(true);
    } else if (isMedium) {
      setVariant("permanent");
      setOpen(false);
    }
  }, [isXLarge, isMedium, isSmall]);

  if (isLoading) return <Loader />;

  let marginTop = variant === "temporary" ? 34 : 44;
  let marginLeft = 0;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {isAuthenticated && (
        <Navbar
          onLogout={logout}
          user={user}
          open={open}
          variant={variant}
          setOpen={setOpen}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: `${marginTop}px`,
          marginLeft: `${marginLeft}px`,
          px: { xs: 1, sm: 2 },
          pb: 2,
          display: "block",
          overflow: "auto",
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={user?.role === "admin" ? "/" : "/gst-invoice"}
                  replace
                />
              ) : (
                <LoginPage onLogin={login} />
              )
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst-invoice"
            element={
              <ProtectedRoute allowedRoles={["admin", "cashier", "customer"]}>
                <GstInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["admin", "customer"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/party-master"
            element={
              <ProtectedRoute allowedRoles={["admin", "cashier", "customer"]}>
                <PartyMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category-master"
            element={
              <ProtectedRoute allowedRoles={["admin", "customer"]}>
                <CategoryMaster />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AppLayout;
