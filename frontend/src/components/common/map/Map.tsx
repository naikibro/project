"use client";
import { Box } from "@mui/material";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

interface MapProps {
  onLoad?: () => void;
}

export default function Map({ onLoad }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [2.3522, 48.8566],
      zoom: 12,
    });

    mapRef.current.on("load", () => {
      onLoad?.();
    });

    const handleResize = () => {
      mapRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mapRef.current?.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, [onLoad]);

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      <Box ref={mapContainerRef} sx={{ height: "100%", width: "100%" }} />
    </Box>
  );
}
