"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import adminTheme from "./AdminTheme";

export default function AdminThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider theme={adminTheme}>{children}</ThemeProvider>;
}
