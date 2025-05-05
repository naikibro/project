import { Button, Typography } from "@mui/material";

export default function Hero() {
  return (
    <section
      aria-label="hero-section"
      className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8"
    >
      <Typography variant="h2" fontWeight="bold">
        SUPMAP
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        The best navigation app in the world
      </Typography>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button variant="contained" color="primary">
          Get Started
        </Button>
        <Button variant="outlined">Learn More</Button>
      </div>
    </section>
  );
}
