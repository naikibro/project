import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { UserDto } from "src/models/User.model";

interface UpdateUserDialogProps {
  open: boolean;
  user: UserDto | null;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<UserDto>) => void;
}

const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({
  open,
  user,
  onClose,
  onUpdate,
}) => {
  const [updatedUser, setUpdatedUser] = useState<Partial<UserDto>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(updatedUser);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update User</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          name="username"
          defaultValue={user?.username}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Email"
          name="email"
          defaultValue={user?.email}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserDialog;
