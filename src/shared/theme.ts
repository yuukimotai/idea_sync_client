import { createTheme } from "@mui/material/styles";

export const softTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7C6BE0",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#E8A09A",
      contrastText: "#2D2B3D",
    },
    background: {
      default: "#F5F1FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#333333",
      secondary: "#7B6FA3",
    },
    divider: "#E2DDF0",
    error: { main: "#D95F5F" },
    success: { main: "#5FAD7E" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #2D2B3D 0%, #6B5CC4 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(45,43,61,0.15)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 2px 12px rgba(124,107,224,0.08)",
          border: "1px solid #E2DDF0",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 2px 12px rgba(124,107,224,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#EDE9FD",
          color: "#7C6BE0",
          fontWeight: 600,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
});
