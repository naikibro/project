import { AppBar, Box, Toolbar } from "@mui/material";
import Link from "next/link";
import NavbarClient from "./NavbarClient";
import HeaderAuth from "src/components/header-auth";
import Image from "next/image";
import logo from "public/img/logo-vertical.png";

interface NavbarProps {
  isTransparent?: boolean;
}

const navLinks = [
  { text: "Features", href: "/features" },
  { text: "Pricing", href: "/pricing" },
  { text: "About", href: "/about" },
  { text: "Contact", href: "/contact" },
];

const Navbar = ({ isTransparent = false }: NavbarProps) => {
  return (
    <AppBar
      position={isTransparent ? "fixed" : "static"}
      elevation={0}
      sx={{
        background: isTransparent
          ? "rgba(255, 255, 255, 0) !important"
          : "white !important",
        bgcolor: isTransparent
          ? "rgba(255, 255, 255, 0) !important"
          : "white !important",
        backdropFilter: isTransparent ? "blur(8px)" : "none",
        boxShadow: "none !important",
        color: "black",
        width: "100%",
        "& .MuiToolbar-root": {
          background: "transparent !important",
          bgcolor: "transparent !important",
        },
      }}
    >
      <Toolbar
        aria-label="header"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "inherit",
          }}
        >
          <Image
            aria-label="header-logo"
            src={logo}
            alt="header-logo"
            width={150}
            height={150}
          />
        </Link>

        {/* Mobile Navigation (Client Component) */}
        <NavbarClient navLinks={navLinks} />

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <HeaderAuth />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
