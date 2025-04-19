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
      "Enjoy a high-performance mapping experience with Mapbox’s premium APIs.",
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
