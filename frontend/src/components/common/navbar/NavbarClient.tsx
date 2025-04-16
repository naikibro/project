"use client";

import {
  DashboardOutlined,
  HomeOutlined,
  Menu,
  PhoneOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderAuth from "src/components/header-auth";
import { useAuthStore } from "src/store/useAuthStore";

interface NavbarClientProps {
  navLinks: { text: string; href: string }[];
}

const NavbarClient = ({ navLinks }: NavbarClientProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, getUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, [user, getUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
        <>
          <Button
            component={Link}
            href={"/"}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            <HomeOutlined
              sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" } }}
            />
          </Button>
          <Divider orientation="vertical" flexItem />
        </>
        {user && (
          <Button component={Link} href={"/dashboard"}>
            <DashboardOutlined />
            Dashboard
          </Button>
        )}
        {navLinks.map((link) => (
          <Button
            key={link.text}
            component={Link}
            href={link.href}
            variant="text"
          >
            {link.text === "Contact" && <PhoneOutlined />}
            {link.text}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: "flex", md: "none" }, gap: 2 }}>
          <HeaderAuth />
        </Box>

        {/* Mobile Menu Button */}
        <IconButton
          edge="end"
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={handleDrawerToggle}
          aria-label="menu-button"
        >
          <Menu />
        </IconButton>

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
          <List sx={{ width: 250 }}>
            <ListItem key="home" disablePadding>
              <ListItemButton
                component={Link}
                href={"/"}
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <HomeOutlined />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            {user && (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={"/dashboard"}
                    onClick={handleDrawerToggle}
                  >
                    <ListItemIcon>
                      <DashboardOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {navLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>
                    {link.text === "Contact" && <PhoneOutlined />}
                  </ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
    </>
  );
};

export default NavbarClient;
