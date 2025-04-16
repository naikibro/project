import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User } from "src/models/User.model";
import HeaderAuth from "./header-auth";

jest.mock("src/store/useAuthStore", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-hot-toast");

describe("HeaderAuth", () => {
  const mockRouter = { push: jest.fn(), refresh: jest.fn() };
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockUseAuthStore = (user: User | null) => {
    const { useAuthStore } = jest.requireMock("src/store/useAuthStore");
    useAuthStore.mockReturnValue({
      user,
      logout: mockLogout,
    });
  };

  it("renders sign in and sign up buttons when no user is logged in", () => {
    mockUseAuthStore(null);

    render(<HeaderAuth />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("renders username and sign out button when user is logged in", async () => {
    mockUseAuthStore({
      username: "testuser",
      id: 0,
      email: "",
      password: "",
      googleId: "",
      isActive: true,
      profilePicture: "",
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
      createdAt: undefined,
      role: undefined,
    });

    render(<HeaderAuth />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("handles sign out correctly", async () => {
    mockUseAuthStore({
      username: "testuser",
      id: 0,
      email: "",
      password: "",
      googleId: "",
      isActive: true,
      profilePicture: "",
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
      createdAt: undefined,
      role: undefined,
    });

    render(<HeaderAuth />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("signout-button"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Logged out successfully.");
      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });
  });
});
