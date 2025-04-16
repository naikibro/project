import { AppBar, Toolbar } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";

jest.mock("@mui/material", () => ({
  AppBar: jest.fn(({ children }) => <div>{children}</div>),
  Toolbar: jest.fn(({ children }) => <div>{children}</div>),
  Box: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: jest.fn(({ children, href }) => <a href={href}>{children}</a>),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn(({ src, alt, width, height }) => {
    const srcString =
      typeof src === "object" && src !== null && src.src ? src.src : src;

    // eslint-disable-next-line @next/next/no-img-element
    return <img src={srcString} alt={alt} width={width} height={height} />;
  }),
}));

jest.mock("./NavbarClient", () => jest.fn(() => <div>NavbarClient</div>));
jest.mock("src/components/header-auth", () =>
  jest.fn(() => <div>HeaderAuth</div>)
);

describe("Navbar", () => {
  it("renders the AppBar component", () => {
    render(<Navbar />);
    expect(AppBar).toHaveBeenCalled();
  });

  it("renders the Toolbar component", () => {
    render(<Navbar />);
    expect(Toolbar).toHaveBeenCalled();
  });

  it("renders the logo with correct attributes", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("header-logo");
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute("src")).toContain("img.jpg");
    expect(logo).toHaveAttribute("width", "150");
    expect(logo).toHaveAttribute("height", "150");
  });

  it("renders the NavbarClient component", () => {
    render(<Navbar />);
    expect(screen.getByText("NavbarClient")).toBeInTheDocument();
  });

  it("renders the HeaderAuth component", () => {
    render(<Navbar />);
    expect(screen.getByText("HeaderAuth")).toBeInTheDocument();
  });
});
