import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
