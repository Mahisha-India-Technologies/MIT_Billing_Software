import React, { useState, useEffect } from "react";
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

const AppLayout = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isXLarge = useMediaQuery("(min-width:1200px)");
  const isSmall = useMediaQuery("(max-width:600px)");
  const isMedium = useMediaQuery("(min-width:600px) and (max-width:1200px)");
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState("permanent");

  // ✅ Responsive sidebar variant
  useEffect(() => {
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

  // ✅ Check auth on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  // ✅ Auto logout after 15 seconds (testing only)
  useEffect(() => {
    let logoutTimer;

    if (isAuthenticated) {
      console.log("🕒 Starting 20-hour auto-logout timer...");
      logoutTimer = setTimeout(() => {
        console.log("🔒 Auto logging out user after 20 hours...");
        handleLogout();
      }, 20 * 60 * 60 * 1000); // 20 hours in milliseconds
    }

    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        console.log("⛔ Logout timer cleared");
      }
    };
  }, [isAuthenticated]);

  // ✅ Login logic
  const handleLogin = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", token);
    setUser(userData);
    setIsAuthenticated(true);

    if (userData.role === "admin") navigate("/");
    else navigate("/gst-invoice");
  };

  // ✅ Logout logic
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  // ✅ Protected route logic
  const PrivateRoute = ({ element: Element, roles }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!roles.includes(user?.role)) {
      const defaultPath =
        user?.role === "admin"
          ? "/"
          : user?.role === "cashier"
          ? "/gst-invoice"
          : "/gst-invoice";
      return <Navigate to={defaultPath} replace />;
    }
    return <Element />;
  };

  // ✅ Show loader while checking login
  if (loading) return <Loader />;

  let marginTop = variant === "temporary" ? 34 : 44;
  let marginLeft = 0;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {isAuthenticated && (
        <Navbar
          onLogout={handleLogout}
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
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={<PrivateRoute element={Dashboard} roles={["admin"]} />}
          />
          <Route
            path="/add-users"
            element={<PrivateRoute element={AddUsers} roles={["admin"]} />}
          />
          <Route
            path="/gst-invoice"
            element={
              <PrivateRoute
                element={GstInvoice}
                roles={["admin", "cashier", "customer"]}
              />
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute element={Products} roles={["admin", "customer"]} />
            }
          />
          <Route
            path="/party-master"
            element={
              <PrivateRoute
                element={PartyMaster}
                roles={["admin", "cashier", "customer"]}
              />
            }
          />
          <Route
            path="/category-master"
            element={
              <PrivateRoute
                element={CategoryMaster}
                roles={["admin", "customer"]}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AppLayout;
