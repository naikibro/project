import {
  DeleteForever as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { UserDto } from "src/models/User.model";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ProfileEditDialog from "./ProfileEditDialog";

interface ProfileManagerProps {
  user: UserDto;
  onDelete: () => void;
}

const ProfileManager = ({ user, onDelete }: ProfileManagerProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDelete = async () => {
    setDeleteOpen(false);
    try {
      onDelete();
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("Error deleting account.");
      console.error(error);
    }
  };

  // Generate user avatar or placeholder
  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };

  // Generate random pastel color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      "#FFB6C1",
      "#FFD700",
      "#ADFF2F",
      "#00FFFF",
      "#FF69B4",
      "#87CEEB",
      "#DDA0DD",
      "#F0E68C",
    ];

    const index = username
      ? username.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        colors.length
      : 0;

    return colors[index];
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Avatar section */}
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Avatar
              sx={{
                width: isMobile ? 100 : 150,
                height: isMobile ? 100 : 150,
                fontSize: isMobile ? 40 : 64,
                bgcolor: getAvatarColor(user.username),
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {getInitials(user.username)}
            </Avatar>
          </Grid>

          {/* User info section */}
          <Grid item xs={12} sm={8}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h2"
              gutterBottom
              fontWeight="bold"
            >
              My Profile
            </Typography>

            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Username
              </Typography>
              <Typography variant="h6" gutterBottom>
                {user.username || "Not set"}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Email
              </Typography>
              <Typography variant="h6" gutterBottom>
                {user.email}
              </Typography>
            </Box>

            {user.role && (
              <Box sx={{ mt: 3, mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {user.role.name}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            fullWidth={isMobile}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Edit Profile
          </Button>

          <Button
            aria-label="delete-account-button"
            variant="contained"
            color="error"
            size="large"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
            fullWidth={isMobile}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        open={editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default ProfileManager;
