import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import UpdateUserDialog from "./UpdateUserDialog";
import { UserDto } from "src/models/User.model";

describe("UpdateUserDialog", () => {
  const mockUser: UserDto = {
    id: "1",
    username: "testuser",
    email: "testuser@example.com",
    isActive: false,
    acceptedTerms: false,
    acceptedPrivacyPolicy: false,
    role: undefined,
  };

  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  it("renders correctly when open", () => {
    render(
      <UpdateUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <UpdateUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.click(screen.getByText(/cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onUpdate with updated user data when save button is clicked", () => {
    render(
      <UpdateUserDialog
        open={true}
        user={mockUser}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "updateduser" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "updateduser@example.com" },
    });

    fireEvent.click(screen.getByText(/save/i));
    expect(mockOnUpdate).toHaveBeenCalledWith({
      username: "updateduser",
      email: "updateduser@example.com",
    });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
