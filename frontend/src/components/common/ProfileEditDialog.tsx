import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  IconButton,
  Avatar,
  Typography,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Close as CloseIcon, Lock as LockIcon } from "@mui/icons-material";
import { UserDto } from "src/models/User.model";
import toast from "react-hot-toast";

interface ProfileEditDialogProps {
  open: boolean;
  user: UserDto;
  onClose: () => void;
}

const ProfileEditDialog = ({ open, user, onClose }: ProfileEditDialogProps) => {
  const [username, setUsername] = useState(user.username);

  const handleUpdate = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      toast.success("User updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Error updating user.");
      console.error("Error updating user:", error);
    }
  };

  // Generate user avatar or placeholder
  const getInitials = (username: string) => {
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
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Edit Profile</Typography>
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
            {getInitials(username)}
          </Avatar>
          <Typography variant="subtitle1">
            Edit your profile information
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <TextField
          label="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          margin="normal"
          InputProps={{
            sx: { borderRadius: 1.5 },
          }}
        />

        <TextField
          label="Email"
          fullWidth
          value={user.email}
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
          onClick={handleUpdate}
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

export default ProfileEditDialog;
