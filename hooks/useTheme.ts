import { useColorScheme } from "@/hooks/useColorScheme";
import { getTheme, type Theme } from "@/theme";
import { useMemo } from "react";

/**
 * Hook to get the current theme based on user's color scheme preference
 * Returns theme object with colors, spacing, fontSize, typography, and other design tokens
 */
export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();

  const theme = useMemo(() => getTheme(colorScheme ?? "light"), [colorScheme]);

  return theme;
};