import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import toast from "react-hot-toast";
import { UserDto } from "src/models/User.model";
import UsersList from "./UsersList";

jest.mock("react-hot-toast");

const mockFetchUsers = jest.fn();

const mockUsers: UserDto[] = [
  {
    id: "1",
    username: "user1",
    email: "user1@example.com",
    isActive: false,
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    role: undefined,
  },
  {
    id: "2",
    username: "user2",
    email: "user2@example.com",
    isActive: false,
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    role: undefined,
  },
];

describe("UsersList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the users list", () => {
    render(<UsersList users={mockUsers} fetchUsers={mockFetchUsers} />);

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("user2@example.com")).toBeInTheDocument();
  });

  it("opens the update dialog when update button is clicked", () => {
    render(<UsersList users={mockUsers} fetchUsers={mockFetchUsers} />);

    fireEvent.click(screen.getAllByText("Update")[0]);

    expect(screen.getByText("Update User")).toBeInTheDocument();
  });

  it("opens the delete confirmation dialog when delete button is clicked", () => {
    render(<UsersList users={mockUsers} fetchUsers={mockFetchUsers} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
  });

  it("calls fetchUsers after updating a user", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as jest.Mock;

    render(<UsersList users={mockUsers} fetchUsers={mockFetchUsers} />);

    fireEvent.click(screen.getAllByText("Update")[0]);

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("User updated successfully!");
    });
  });

  it("calls fetchUsers after deleting a user", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as jest.Mock;

    render(<UsersList users={mockUsers} fetchUsers={mockFetchUsers} />);

    fireEvent.click(screen.getAllByText("Delete")[0]);

    const confirmDialog = screen.getByRole("dialog");
    fireEvent.click(within(confirmDialog).getByText("Delete"));

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("User deleted successfully!");
    });
  });
});
