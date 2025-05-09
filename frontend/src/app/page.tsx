"use client";
import { Box, Fade, Slide, Skeleton, Button } from "@mui/material";
import Footer from "src/components/common/Footer";
import Map from "src/components/common/map/Map";
import Navbar from "src/components/common/navbar/Navbar";
import Hero from "src/components/Hero";
import FeaturesSection from "./(nav-pages)/features/page";
import PricingPage from "./(nav-pages)/pricing/page";
import { useEffect, useState } from "react";
import phone from "public/img/phonefront.png";
import sidephone from "public/img/phoneside.png";
import Image from "next/image";

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
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: "10px", sm: "20px" },
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 3,
                    width: { xs: "90%", sm: "auto" },
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      borderRadius: "20px",
                      px: { xs: 2, sm: 4 },
                      py: 1,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      width: { xs: "100%", sm: "auto" },
                    }}
                    href="https://k7hfcl3c2m0luhwe.public.blob.vercel-storage.com/app-release-KpHBqJCnulgGYCzUkNtPbpuHxwjdaW.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download App
                  </Button>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "90%", sm: "80%", md: "60%", lg: "50%" },
                      height: { xs: "auto", sm: "auto" },
                      maxWidth: "500px",
                      transform: { xs: "scale(0.8)", sm: "scale(1)" },
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: { xs: "scale(0.9)", sm: "scale(1.1)" },
                      },
                    }}
                    component="a"
                    href="https://k7hfcl3c2m0luhwe.public.blob.vercel-storage.com/app-release-KpHBqJCnulgGYCzUkNtPbpuHxwjdaW.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: "100%",
                        left: { xs: "-30%", sm: "-40%" },
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-50%) scale(1.1)",
                        },
                      }}
                    >
                      <Image
                        src={sidephone}
                        alt="phone side view"
                        priority
                        style={{
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    </Box>
                    <Image
                      src={phone}
                      alt="phone front view"
                      priority
                      style={{
                        width: "100%",
                        height: "auto",
                        position: "relative",
                        zIndex: 2,
                        transition: "transform 0.3s ease-in-out",
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, position: "relative" }}>
                  <Map onLoad={handleMapLoad} />
                </Box>
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
