"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Link,
  Paper,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import Image from "next/image";
import logo from "public/images/logo-full-black.png";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "src/store/useAuthStore";
import GoogleIcon from "@mui/icons-material/Google";

const SignInPage: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    const isValidEmail = /\S+@\S+\.\S+/.test(form.email);
    const isValidPassword = form.password.length >= 6;
    setIsFormValid(isValidEmail && isValidPassword);
  }, [form.email, form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);
      await login(form.email, form.password);
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Toaster position="bottom-right" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          maxWidth: 400,
        }}
      >
        <Link href="/">
          <Image src={logo} alt="Logo" width={300} height={300} />
        </Link>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "100%" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 2 }}
            >
              Sign in with Google
            </Button>

            <Typography
              variant="caption"
              align="center"
              sx={{ display: "block", mt: 1 }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                underline="hover"
                sx={{ fontWeight: "bold" }}
              >
                Sign Up
              </Link>
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignInPage;
