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
  Group as TeamIcon,
  Public as GlobeIcon,
  Lightbulb as VisionIcon,
  Warning as ChallengesIcon,
} from "@mui/icons-material";

const sections = [
  {
    title: "Why We Created SUPMAP",
    description:
      "Trafine wanted a real-time navigation app similar to Waze, providing traffic updates, accident reports, and optimized routes. We believe in the power of community-driven navigation to make urban mobility more efficient, collaborative, and sustainable.",
    icon: <VisionIcon sx={{ fontSize: 50, color: "primary.main" }} />,
  },
  {
    title: "How SUPMAP Helps You",
    description:
      "With real-time insights, SUPMAP predicts road closures, standstill traffic, and unexpected delays, ensuring a smoother, stress-free travel experience. Whether commuting or road-tripping, you’ll always stay ahead of the road.",
    icon: <GlobeIcon sx={{ fontSize: 50, color: "secondary.main" }} />,
  },
  {
    title: "Our Challenges",
    description:
      "We’re newcomers in a competitive market. Cloud costs may skyrocket with growth, and we must comply with GDPR and privacy laws. With limited time and budget, we aim to build a robust and scalable navigation system.",
    icon: <ChallengesIcon sx={{ fontSize: 50, color: "error.main" }} />,
  },
  {
    title: "Meet the Team",
    description:
      "SUPMAP was created by the DELTAFORCE team from Supinfo. Led by Vaanaiki Brotherson and supported by Maxime Nguyen, Chrinovic Kibangu Tsimba, and Ludivine Tulcibiez, we’re passionate about making navigation smarter.",
    icon: <TeamIcon sx={{ fontSize: 50, color: "success.main" }} />,
  },
];

export default async function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" fontWeight="bold">
          About SUPMAP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          We created SUPMAP to revolutionize navigation through{" "}
          <strong>real-time updates</strong>,{" "}
          <strong>community-driven insights</strong>, and{" "}
          <strong>AI-powered routing</strong>.
        </Typography>
      </Box>

      {/* Sections Grid */}
      <Grid container spacing={4}>
        {sections.map((section, index) => (
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
              {section.icon}
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call-to-Action (CTA) */}
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h5" fontWeight="bold">
          Discover More About SUPMAP
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, mb: 4 }}
        >
          Learn how we’re shaping the future of smart navigation.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          href="/features"
        >
          Explore Features
        </Button>
      </Box>
    </Container>
  );
}
