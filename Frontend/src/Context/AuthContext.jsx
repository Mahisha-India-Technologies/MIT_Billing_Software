// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ loading state
  let logoutTimer = null;

  // ⏱ Auto logout helper
  const setupAutoLogout = (token) => {
    try {
const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // seconds

      if (decoded.exp < currentTime) {
        handleLogout();
      } else {
        const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
        logoutTimer = setTimeout(() => {
          handleLogout();
        }, timeUntilExpiry);
      }
    } catch (error) {
      console.error("Token decode failed:", error);
      handleLogout();
    }
  };

  // ✅ On mount, check localStorage for auth
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setupAutoLogout(token);
    }

    setLoading(false); // ✅ done loading
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", token);
    setUser(userData);
    setupAutoLogout(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // full reload to clear state
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
