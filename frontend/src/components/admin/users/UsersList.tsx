import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { UserDto } from "src/models/User.model";
import UpdateUserDialog from "./UpdateUserDialog";

interface UsersListProps {
  users: UserDto[];
  fetchUsers: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, fetchUsers }) => {
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdate = async (updatedUser: Partial<UserDto>) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedUser),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      toast.success("User updated successfully!");

      setUpdateDialogOpen(false);
      setSelectedUser(null);

      fetchUsers();
    } catch (error) {
      toast.error("Error updating user.");
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.username}`,
        {
          method: "DELETE",
          credentials: "include",
          body: JSON.stringify({
            username: selectedUser.username,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      toast.success("User deleted successfully!");

      setDeleteDialogOpen(false);
      setSelectedUser(null);

      fetchUsers();
    } catch (error) {
      toast.error("Error deleting user.");
      console.error("Error deleting user:", error);
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          boxShadow: 3,
          borderRadius: 2,
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell> Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover sx={{ cursor: "pointer" }}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setSelectedUser(user);
                      setUpdateDialogOpen(true);
                    }}
                  >
                    Update
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedUser(user);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update User Dialog */}
      <UpdateUserDialog
        open={updateDialogOpen}
        user={selectedUser}
        onClose={() => {
          setUpdateDialogOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersList;
