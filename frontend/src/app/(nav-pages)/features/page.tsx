import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from "@mui/material";
import Link from "next/link";
import {
  Map as MapIcon,
  ReportProblem as ReportIcon,
  People as CommunityIcon,
  Layers as MapboxIcon,
} from "@mui/icons-material";
import phone from "public/img/phonefront.png";
import sidephone from "public/img/phoneside.png";
import Image from "next/image";
const features = [
  {
    title: "Real-Time Navigation",
    description:
      "Navigate seamlessly with AI-powered real-time traffic updates and optimized routes.",
    icon: <MapIcon sx={{ fontSize: 60, color: "primary.main" }} />,
  },
  {
    title: "Incident Reporting",
    description:
      "Report accidents, roadblocks, and hazards with a simple tap to alert other users.",
    icon: <ReportIcon sx={{ fontSize: 60, color: "error.main" }} />,
  },
  {
    title: "Community-Validated Alerts",
    description:
      "Trust in user-verified updates, ensuring accurate and reliable information.",
    icon: <CommunityIcon sx={{ fontSize: 60, color: "secondary.main" }} />,
  },
  {
    title: "Integrated with Mapbox",
    description:
      "Enjoy a high-performance mapping experience with Mapbox's premium APIs.",
    icon: <MapboxIcon sx={{ fontSize: 60, color: "success.main" }} />,
  },
];

export default function FeaturesSection() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" fontWeight="bold">
          Experience the Future of Navigation
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          SUPMAP delivers <b>real-time</b> updates, optimized routing, and
          <b> AI-driven</b> insights to keep you moving efficiently.
        </Typography>
      </Box>

      {/* Video Section */}
      <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto", mb: 6 }}>
        <Box
          sx={{
            width: "100%",
            height: 0,
            paddingBottom: "56.25%",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: { xs: "-40%", sm: "-50%", md: "-60%" },
              height: "100%",
              width: { xs: "40%", sm: "50%", md: "60%" },
              zIndex: 0,
              display: { xs: "none", sm: "block" },
              opacity: 0.8,
              cursor: "pointer",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
                opacity: 1,
              },
            }}
            component="a"
            href="https://k7hfcl3c2m0luhwe.public.blob.vercel-storage.com/app-release-KpHBqJCnulgGYCzUkNtPbpuHxwjdaW.apk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={phone}
              alt="phone front view"
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "8px",
              zIndex: 2,
            }}
            src="https://www.youtube.com/embed/03OLAPmGjGM?si=V-9wPPXjZ-Mmyav5"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: { xs: "-40%", sm: "-50%", md: "-60%" },
              height: "100%",
              width: { xs: "40%", sm: "50%", md: "60%" },
              zIndex: 0,
              display: { xs: "none", sm: "block" },
              opacity: 0.8,
              cursor: "pointer",
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
                opacity: 1,
              },
            }}
            component="a"
            href="https://k7hfcl3c2m0luhwe.public.blob.vercel-storage.com/app-release-KpHBqJCnulgGYCzUkNtPbpuHxwjdaW.apk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={sidephone}
              alt="phone side view"
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {feature.icon}
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Analyze your travel patterns and optimize your routes with our
          comprehensive analytics.
        </Typography>

        <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto", mt: 4 }}>
          <Box
            sx={{
              width: "100%",
              height: 0,
              paddingBottom: "56.25%",
              position: "relative",
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "8px",
              }}
              src="https://www.youtube.com/embed/5BTN6V3eGNY?si=0nFvsj8E05EFspjK"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </Box>
        </Box>
      </Box>

      {/* Call-to-Action (CTA) */}
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h4" fontWeight="bold">
          Join the Future of Smart Navigation
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, mb: 4 }}
        >
          Download the SUPMAP app today and experience seamless, real-time
          travel solutions.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          href="/sign-up"
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}
