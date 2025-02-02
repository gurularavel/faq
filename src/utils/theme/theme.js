import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 992,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: '"Poppins",sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  // Component overrides
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "14px 16px",
          boxShadow: "none",
          lineHeight: "100%",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            opacity: 0.9,
          },
        },
        outlined: {
          borderWidth: "0px",
          "&:hover": {
            borderWidth: "0px",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            position: "relative",
            transform: "none",
            fontSize: "14px",
            color: "#1F1F1F",
            marginBottom: "8px",
            marginLeft: "8px",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              border: "1px solid #E6E9ED",
              borderRadius: "6px",
              top: 0,
              legend: {
                display: "none",
              },
            },
            "&:hover fieldset": {
              borderColor: "#E6E9ED",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#E6E9ED",
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "9.5px 14px",
          },
        },
      },
      defaultProps: {
        variant: "outlined",
        InputLabelProps: {
          shrink: true,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: " 0px 0px 8px 0px #00000029",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontWeight: 500,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "1414px",
        },
      },
    },
  },

  // Custom palette
  palette: {
    primary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
      contrastText: "#fff",
    },
    secondary: {
      main: "#F50057",
      light: "#FF4081",
      dark: "#C51162",
      contrastText: "#fff",
    },
    error: {
      main: "#FF003C",
      light: "#E57373",
      dark: "#D32F2F",
    },
    warning: {
      main: "#FFA726",
      light: "#FFB74D",
      dark: "#F57C00",
    },
    success: {
      main: "#66BB6A",
      light: "#81C784",
      dark: "#388E3C",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
  },
});

export default theme;
