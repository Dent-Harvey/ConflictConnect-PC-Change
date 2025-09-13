import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/useColorScheme';
import { errorHandler } from '@/utils/errorHandler';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// DO NOT REMOVE THIS COMPONENT. It is used to send errors to host app's error handler.
export function ErrorBoundary({ error, }: ErrorBoundaryProps) {
  useEffect(() => {
    if (error) {
      errorHandler({
        filePath: "_layout",
        error,
        functionName: "ErrorBoundary",
      });
    }
  }, [error]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter-ExtraBold.ttf"),
    "Inter-Black": require("../assets/fonts/Inter-Black.ttf"),
  });

  if (!loaded && !error) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="email-test" options={{ headerShown: false }} />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false
                }} 
              />
              <Stack.Screen 
                name="resource-matches"
                options={{ 
                  headerShown: false,
                  presentation: 'card'
                }} 
              />
              <Stack.Screen 
                name="conflict/[id]" 
                options={{ 
                  headerShown: true,
                  presentation: 'card',
                  headerTitle: 'Conflict Details'
                }} 
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
