"use client";
import { Box } from "@mui/material";
import Footer from "src/components/common/Footer";
import Map from "src/components/common/map/Map";
import Navbar from "src/components/common/navbar/Navbar";
import Hero from "src/components/Hero";
import FeaturesSection from "./(nav-pages)/features/page";
import PricingPage from "./(nav-pages)/pricing/page";

export default function Page() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen bg-white dark:bg-white">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 4, lg: 8 },
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            width: "100%",
            px: { xs: 2, sm: 4, md: 6, lg: 8 },
            py: { xs: 4, lg: 8 },
          }}
        >
          <Box
            sx={{
              flex: { lg: 1 },
              width: { xs: "100%", lg: "50%" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Hero />
          </Box>
          <Box
            sx={{
              flex: { lg: 1 },
              width: { xs: "100%", lg: "50%" },
              height: { xs: "60vh", lg: "70vh" },
              borderRadius: "10px",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Map />
          </Box>
        </Box>
        <FeaturesSection />
        <PricingPage />
        <Footer />
      </div>
    </>
  );
}
