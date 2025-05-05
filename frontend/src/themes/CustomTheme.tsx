import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#4f46e5", // A vibrant indigo color
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444", // A vibrant red color
      contrastText: "#ffffff",
    },
    success: {
      main: "#22c55e", // A vibrant green color
      contrastText: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
