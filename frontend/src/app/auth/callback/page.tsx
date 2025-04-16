"use client";
import { useEffect } from "react";
import { useAuthStore } from "src/store/useAuthStore";

export default function AuthCallback() {
  const { handleGoogleCallback } = useAuthStore();

  useEffect(() => {
    handleGoogleCallback().catch((error) => {
      console.error("Auth callback error:", error);
    });
  }, [handleGoogleCallback]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2>Signing in...</h2>
    </div>
  );
}
