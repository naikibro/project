import { createTheme } from "@mui/material/styles";

const adminTheme = createTheme({
  palette: {
    primary: {
      main: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      contrastText: "#000000",
    },

    background: {
      default: "#f0f0f0",
      paper: "#f0f0f0",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          textTransform: "none",
          transition: "background-color 250ms ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
        },
      },
    },
  },
});

export default adminTheme;
