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
  Lock as LockIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";

export default function PricingPage() {
  const plans = [
    {
      title: "Basic",
      price: "Coming Soon",
      features: ["Limited Access", "Community Support", "Basic Features"],
      icon: <HourglassIcon sx={{ fontSize: 50, color: "primary.main" }} />,
    },
    {
      title: "Pro",
      price: "Coming Soon",
      features: ["Full Access", "Premium Support", "Advanced Features"],
      icon: <LockIcon sx={{ fontSize: 50, color: "secondary.main" }} />,
    },
    {
      title: "Enterprise",
      price: "Coming Soon",
      features: ["Custom Solasync utions", "Dedicated Support", "Scalability"],
      icon: <LockIcon sx={{ fontSize: 50, color: "success.main" }} />,
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
      {/* Hero Section */}
      <Typography variant="h2" fontWeight="bold">
        Pricing Plans
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2, mb: 6 }}>
        Flexible plans designed for everyone. 🚀
        <br />
        <strong>Pricing details coming soon.</strong>
      </Typography>

      {/* Pricing Cards */}
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                opacity: 0.6,
                pointerEvents: "none",
              }}
            >
              {plan.icon}
              <CardContent>
                <Typography variant="h5" fontWeight="bold">
                  {plan.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  {plan.price}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {plan.features.map((feature, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      ✅ {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call-to-Action (CTA) */}
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h5" fontWeight="bold">
          Want to be the first to know?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, mb: 4 }}
        >
          Sign up to receive updates about our pricing plans.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          href="/sign-up"
        >
          Get Notified
        </Button>
      </Box>
    </Container>
  );
}
