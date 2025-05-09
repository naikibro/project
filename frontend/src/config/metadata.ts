import { Metadata } from "next";

export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Supmap",
  description:
    "Find your way with Supmap – a powerful mapping and navigation solution designed to help you explore with ease.",
  keywords: "Supmap, navigation, mapping, GPS, explore, travel, wayfinding",
  authors: [{ name: "Supmap Team" }],
};
