import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  IconButton,
  Avatar,
  Typography,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Close as CloseIcon, Lock as LockIcon } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
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
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onUpdate(updatedUser);
    onClose();
  };

  const getInitials = (username?: string) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography component="h2" variant="h6">
          Update User
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: "white" }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 4 }}>
          <Avatar
            sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}
          >
            {getInitials(user?.username)}
          </Avatar>
          <Typography variant="subtitle1">Edit user information</Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextField
            inputRef={usernameInputRef}
            label="Username"
            name="username"
            defaultValue={user?.username}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
          />

          <TextField
            label="Email"
            name="email"
            defaultValue={user?.email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            margin="normal"
            disabled
            helperText="Email cannot be changed"
            InputProps={{
              readOnly: true,
              sx: { borderRadius: 1.5, bgcolor: "rgba(0, 0, 0, 0.03)" },
              endAdornment: (
                <InputAdornment position="end">
                  <LockIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <input type="submit" style={{ display: "none" }} />
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: "medium",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSubmit()}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: "medium",
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserDialog;
