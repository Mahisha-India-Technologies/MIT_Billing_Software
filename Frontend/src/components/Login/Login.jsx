import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo2.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import API_BASE_URL from "../../Context/Api";
import { useAuth } from "../../Context/AuthContext";

const LoginPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Access login from context

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef();

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      return setError("Please fill in all fields");
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        first_name: username,
        password,
      });

      const { user, token } = res.data;
      login(user, token); // ✅ Use global login function from context

      // Optional redirect here if needed, but context + AppLayout already handles it
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: isDark ? "#121212" : "#f4f6f8",
        overflow: "hidden",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          bgcolor: isDark ? "#1e1e1e" : "#ffffff",
          color: theme.palette.text.primary,
          borderRadius: 4,
          boxShadow: `0 0 20px ${theme.palette.primary.main}`,
          p: isMobile ? 3 : 4,
          border: `1px solid ${isDark ? "#00bcd4" : "#cfd8dc"}`,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img
            src={logo}
            alt="Logo"
            style={{
              height: isMobile ? 40 : 70,
              objectFit: "contain",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          sx={{ color: theme.palette.primary.main, mb: 2 }}
        >
          Mahisha Bills
        </Typography>

        <Divider sx={{ mb: 3, borderColor: theme.palette.primary.main }} />

        {/* Username */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: isDark ? "#aaa" : "#333" }}>
          Username <Typography component="span" color="error">*</Typography>
        </Typography>
        <TextField
          fullWidth
          required
          placeholder="Enter the Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="dense"
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              passwordRef.current?.focus();
            }
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {/* Password */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: isDark ? "#aaa" : "#333" }}>
          Password <Typography component="span" color="error">*</Typography>
        </Typography>
        <TextField
          fullWidth
          required
          placeholder="Enter the Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="dense"
          variant="outlined"
          inputRef={passwordRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleLogin();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        />

        {error && (
          <Typography variant="body2" color="error" mb={2}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            mt: 1,
            py: 1.2,
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: 3,
            background: theme.palette.primary.main,
            color: "#fff",
            "&:hover": {
              background: isDark
                ? "linear-gradient(45deg, #00acc1, #00e5ff)"
                : "linear-gradient(45deg, rgb(27, 77, 43), rgb(27, 95, 58))",
              boxShadow: `0 0 12px ${theme.palette.primary.main}`,
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
