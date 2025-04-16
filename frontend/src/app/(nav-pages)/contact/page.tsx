"use client";

import { Send as SendIcon } from "@mui/icons-material";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { playfair } from "src/themes/fonts";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! (Functionality to be implemented)");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <h1
          className={`tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6 ${playfair.variable} font-serif`}
        >
          Contact Us
        </h1>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Have a question? Reach out to us!
        </Typography>
      </Box>

      {/* Contact Form */}
      <Box sx={{ mt: 6, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Send Us a Message
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Your Name"
            name="name"
            variant="outlined"
            margin="normal"
            required
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Your Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            required
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Your Message"
            name="message"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            required
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            startIcon={<SendIcon />}
          >
            Send Message
          </Button>
        </form>
      </Box>
    </Container>
  );
}
