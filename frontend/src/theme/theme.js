import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // Global typography and font settings
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    fontSize: 14,
  },

  // Comprehensive Palette Configuration
  palette: {
    // Primary Color Scheme (from original theme files)
    primary: {
      lightest: "#536DFE", // Lightest primary blue
      light: "#304FFE", // Light primary blue
      main: "#1A237E", // Main primary indigo
      dark: "#121037", // Dark primary navy
      contrastText: "#FFFFFF",
    },

    // Secondary Color Scheme
    secondary: {
      lightest: "#ffd740", // Lightest amber
      light: "#FFAB00", // Light amber
      main: "#ff8f00", // Main amber
      dark: "#FF6F00", // Dark amber
      contrastText: "#FFFFFF",
    },

    // Background Colors
    background: {
      default: "#FFFAFA", // Soft cream background
      paper: "#FFFFFF", // White paper background
      emphasis: "#E8EAF6", // Light blue-gray emphasis
      secondary: "#C5CAE9", // Soft blue-gray secondary
      header: "#121037", // From original theme
    },

    // Text Colors
    text: {
      primary: "#1A237E", // Deep indigo
      secondary: "#5C6BC0", // Lighter indigo
      hint: "#9FA8DA", // Soft indigo
      disabled: "#A0A0A0", // Disabled text gray
    },

    // Additional Color Groups from theme2
    primary1: {
      main: "#1A237E",
    },
    primary2: {
      main: "#304FFE",
    },
    primary3: {
      main: "#536DFE",
    },
    secondary1: {
      main: "#ff8f00",
    },
    secondary2: {
      main: "#FFAB00",
    },
    secondary3: {
      main: "#ffd740",
    },

    // Status Colors
    status: {
      danger: "#e53e3e", // From theme2
      success: "#4CAF50",
      error: "#e53e3e",
      warning: "#FF9800",
      info: "#2196F3",
    },

    // Additional text color variants
    text1: "#1A237E",
    text2: "#5C6BC0",
    text3: "#9FA8DA",

    // Contrast threshold from original theme
    contrastThreshold: 2.8,
  },

  // Customizing Component Styles
  components: {
    // Example of global component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Prevents automatic uppercase
          borderRadius: 8, // Consistent rounded corners
        },
      },
    },

    // Remove default shadows
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },

  // Spacing and sizing utilities
  spacing: 8, // Base spacing unit

  // Custom breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  // Shape modifications
  shape: {
    borderRadius: 8,
  },

  // Shadows configuration (from original theme)
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
});

export default theme;
