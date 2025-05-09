"use client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "public/img/logo-full.png";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "src/store/useAuthStore";

const SignUpPage: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.username ||
      !form.email ||
      form.password.length < 8 ||
      !form.acceptedTerms ||
      !form.acceptedPrivacyPolicy
    ) {
      toast.error("Please complete all fields and accept terms.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.success("Account created successfully!");

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        await login(form.email, form.password);
      }

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      toast.error(error.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
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
            Sign Up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              margin="normal"
            />
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
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            {/* ✅ Terms & Privacy Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptedTerms"
                  checked={form.acceptedTerms}
                  onChange={handleChange}
                />
              }
              label="I accept the Terms and Conditions"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptedPrivacyPolicy"
                  checked={form.acceptedPrivacyPolicy}
                  onChange={handleChange}
                />
              }
              label="I accept the Privacy Policy"
            />
            <Typography
              variant="caption"
              align="center"
              sx={{ display: "block", mt: 1 }}
            >
              Already have an account?{" "}
              <Link
                href="/sign-in"
                underline="hover"
                sx={{ fontWeight: "bold" }}
              >
                Sign in
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
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SignUpPage;
