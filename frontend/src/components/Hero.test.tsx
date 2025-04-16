import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "./Hero";

jest.mock("next/font/google", () => ({
  Playfair_Display: jest.fn().mockReturnValue({
    variable: "--font-playfair",
  }),
}));

describe("Hero component", () => {
  it("renders the hero section", () => {
    render(<Hero />);
    const heroSection = screen.getByLabelText("hero-section");
    expect(heroSection).toBeInTheDocument();
  });
});
