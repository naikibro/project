import { Inter_Tight } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeRegistry from "src/themes/ThemeRegistry";
import "../styles/globals.css";
import { Metadata } from "next";
import { metadata as websiteMetadata } from "src/config/metadata";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = websiteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <body className="bg-white text-black transition-colors min-h-screen">
        <ThemeRegistry>{children}</ThemeRegistry>
        <Toaster />
      </body>
    </html>
  );
}
