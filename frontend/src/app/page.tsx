"use client";
import { Box, Fade, Slide, Skeleton } from "@mui/material";
import Footer from "src/components/common/Footer";
import Map from "src/components/common/map/Map";
import Navbar from "src/components/common/navbar/Navbar";
import Hero from "src/components/Hero";
import FeaturesSection from "./(nav-pages)/features/page";
import PricingPage from "./(nav-pages)/pricing/page";
import { useEffect, useState } from "react";

export default function Page() {
  const [showHero, setShowHero] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Stagger the animations
    setShowHero(true);
    setTimeout(() => setShowMap(true), 300);
    setTimeout(() => setShowFeatures(true), 600);
    setTimeout(() => setShowPricing(true), 900);
  }, []);

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

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
          <Fade in={showHero} timeout={800}>
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
          </Fade>
          <Slide
            direction="left"
            in={showMap}
            timeout={800}
            mountOnEnter
            unmountOnExit
          >
            <Box
              sx={{
                flex: { lg: 1 },
                width: { xs: "100%", lg: "50%" },
                height: { xs: "60vh", lg: "70vh" },
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
            >
              {!mapLoaded && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
              )}
              <Box
                sx={{
                  opacity: mapLoaded ? 1 : 0,
                  transition: "opacity 0.5s ease-in-out",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Map onLoad={handleMapLoad} />
              </Box>
            </Box>
          </Slide>
        </Box>
        <Fade in={showFeatures} timeout={800}>
          <Box>
            <FeaturesSection />
          </Box>
        </Fade>
        <Fade in={showPricing} timeout={800}>
          <Box>
            <PricingPage />
          </Box>
        </Fade>
        <Footer />
      </div>
    </>
  );
}
