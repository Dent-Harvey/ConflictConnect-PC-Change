const lightTheme = {
  colorScheme: "light",
  colors: {
    // Core backgrounds and text
    background: "#FAFAFA",
    foreground: "#0A0A0B",
    surface: "#FFFFFF",
    text: "#0A0A0B",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    
    // Primary brand colors - Professional navy blue
    primary: "#1E40AF",
    onPrimary: "#FFFFFF",
    primaryForeground: "#FFFFFF",
    
    // Secondary - Muted blue-gray
    secondary: "#64748B",
    onSecondary: "#FFFFFF",
    secondaryForeground: "#FFFFFF",
    
    // Status and feedback colors
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    
    // UI elements
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    accent: "#3B82F6",
    accentForeground: "#FFFFFF",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    border: "#E2E8F0",
    input: "#F8FAFC",
    ring: "#1E40AF",
    
    // Operations room specific colors for light theme
    hotspot: "#DC2626", // Red for active conflicts
    intel: "#2563EB", // Blue for intelligence sources
    tactical: "#059669", // Green for tactical elements
    classified: "#D97706", // Orange for classified information
    grid: "#1E40AF15", // Semi-transparent blue for grid overlay
    radar: "#059669", // Green for radar sweep
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
  borderRadius: {
    hairline: 1,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  hairlineWidth: 0.5,
  typography: {
    display: {
      fontSize: 60,
      lineHeight: 66,
      fontWeight: "800" as const,
      letterSpacing: -0.025,
      fontFamily: "Inter-ExtraBold",
    },
    h1: {
      fontSize: 48,
      lineHeight: 58,
      fontWeight: "700" as const,
      letterSpacing: -0.025,
      fontFamily: "Inter-Bold",
    },
    h2: {
      fontSize: 36,
      lineHeight: 45,
      fontWeight: "700" as const,
      letterSpacing: -0.025,
      fontFamily: "Inter-Bold",
    },
    h3: {
      fontSize: 30,
      lineHeight: 39,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    h4: {
      fontSize: 24,
      lineHeight: 33,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    h5: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    h6: {
      fontSize: 18,
      lineHeight: 25,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400" as const,
      fontFamily: "Inter-Regular",
    },
    bodyLarge: {
      fontSize: 18,
      lineHeight: 27,
      fontWeight: "400" as const,
      fontFamily: "Inter-Regular",
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "400" as const,
      fontFamily: "Inter-Regular",
    },
    caption: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "400" as const,
      fontFamily: "Inter-Regular",
    },
    overline: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "500" as const,
      letterSpacing: 0.1,
      textTransform: "uppercase" as const,
      fontFamily: "Inter-Medium",
    },
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    buttonLarge: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "600" as const,
      fontFamily: "Inter-SemiBold",
    },
    link: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500" as const,
      textDecorationLine: "underline" as const,
      fontFamily: "Inter-Medium",
    },
  },
};

const darkTheme = {
  ...lightTheme,
  colorScheme: "dark",
  colors: {
    // Core backgrounds and text - Operations Room Dark
    background: "#0D1117",
    foreground: "#F0F6FF",
    surface: "#161B22",
    text: "#F0F6FF",
    textSecondary: "#7D8590",
    textTertiary: "#8B949E",
    
    // Primary colors - Tactical Blue
    primary: "#0EA5E9",
    onPrimary: "#FFFFFF",
    primaryForeground: "#FFFFFF",
    
    // Secondary - Military Gray
    secondary: "#6E7681",
    onSecondary: "#FFFFFF",
    secondaryForeground: "#FFFFFF",
    
    // Status and feedback colors - Military themed
    success: "#00D100", // Bright green for confirmed
    warning: "#FFA500", // Orange for caution
    error: "#FF0000", // Bright red for critical
    info: "#00BFFF", // Bright cyan for intel
    
    // Tactical UI elements
    muted: "#21262D",
    mutedForeground: "#8B949E",
    accent: "#58A6FF",
    accentForeground: "#FFFFFF",
    destructive: "#FF4444",
    destructiveForeground: "#FFFFFF",
    border: "#30363D",
    input: "#0D1117",
    ring: "#0EA5E9",
    
    // Operations room specific colors
    hotspot: "#FF4500", // Bright red-orange for active conflicts
    intel: "#00FFFF", // Cyan for intelligence sources
    tactical: "#32CD32", // Lime green for tactical elements
    classified: "#FFD700", // Gold for classified information
    grid: "#1F6FEB20", // Semi-transparent blue for grid overlay
    radar: "#00FF00", // Bright green for radar sweep
  },
};

export type Theme = typeof lightTheme;

export const getTheme = (colorScheme: "light" | "dark"): Theme => {
  return colorScheme === "dark" ? darkTheme : lightTheme;
};