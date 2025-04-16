"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "src/themes/CustomTheme";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
