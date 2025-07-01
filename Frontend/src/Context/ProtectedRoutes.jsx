// src/layouts/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role)) {
    const fallback =
      user?.role === "admin"
        ? "/"
        : user?.role === "cashier"
        ? "/gst-invoice"
        : "/gst-invoice";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
