import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import NavbarClient from "./NavbarClient";

jest.mock("src/store/useAuthStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NavbarClient", () => {
  const mockNavLinks = [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
  ];

  let mockGetUser: jest.Mock;
  let mockUser: unknown;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ refresh: jest.fn() });

    mockGetUser = jest.fn();
    mockUser = null;

    const { useAuthStore } = jest.requireMock("src/store/useAuthStore");
    useAuthStore.mockReturnValue({
      user: mockUser,
      getUser: mockGetUser,
    });
  });

  it("renders navigation links", () => {
    render(<NavbarClient navLinks={mockNavLinks} />);
    mockNavLinks.forEach((link) => {
      expect(screen.getByText(link.text)).toBeInTheDocument();
    });
  });

  it("toggles mobile drawer", () => {
    render(<NavbarClient navLinks={mockNavLinks} />);
    const menuButton = screen.getByLabelText("menu-button");
    fireEvent.click(menuButton);
    expect(screen.getByRole("presentation")).toBeInTheDocument();
    fireEvent.click(menuButton);
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });
});
