import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AdminUsersPanel from "./AdminUsersPanel";

const mockUsers = [
  { id: "1", username: "John Doe", email: "john@example.com" },
  { id: "2", username: "Jane Doe", email: "jane@example.com" },
];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});

  // Ensure fetch is defined before mocking
  if (!global.fetch) {
    global.fetch = jest.fn();
  }

  jest.spyOn(global, "fetch").mockImplementation((url) => {
    if (url === `${process.env.NEXT_PUBLIC_API_URL}/users/all`) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      }) as Promise<Response>;
    }
    return Promise.reject(new Error("Unexpected API call"));
  });
});

describe("AdminUsersPanel", () => {
  test("renders users list after fetching users", async () => {
    render(<AdminUsersPanel />);

    await waitFor(() => expect(screen.getByText("Users")).toBeInTheDocument());
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  test("renders error message on fetch failure", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
      () =>
        Promise.resolve({
          ok: false,
        }) as Promise<Response>
    );

    render(<AdminUsersPanel />);

    await waitFor(() =>
      expect(screen.getByText("Error fetching users.")).toBeInTheDocument()
    );
  });
});
