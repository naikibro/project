import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteDialog = ({
  open,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) => {
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
          bgcolor: "error.main",
          color: "white",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Confirm Account Deletion</Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: "white" }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h6" color="error.main">
            This action cannot be undone
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          You are about to permanently delete your account. This will:
        </Typography>

        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Remove all your personal information
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Delete your account data
          </Typography>
          <Typography component="li" variant="body1">
            Log you out immediately
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mt: 3, fontWeight: "medium" }}>
          Are you absolutely sure you want to continue?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
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
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: "medium",
          }}
        >
          Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
