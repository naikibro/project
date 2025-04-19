"use client";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "public/img/logo-full.png";
import React, { Suspense, useState } from "react";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      toast.success(
        "If an account exists, a password reset link will be sent to your email"
      );
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password has been successfully reset");
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
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
            Reset Password
          </Typography>
          {!token ? (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </Typography>
              <Box component="form" noValidate onSubmit={handleForgotPassword}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  margin="normal"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Enter your new password below.
              </Typography>
              <Box component="form" noValidate onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  margin="normal"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </Box>
            </>
          )}
          <Typography
            variant="caption"
            align="center"
            sx={{ display: "block", mt: 2 }}
          >
            Remember your password? <Link href="/sign-in">Sign in</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
