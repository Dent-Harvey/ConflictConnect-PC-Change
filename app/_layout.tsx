import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { errorHandler } from '@/utils/errorHandler';
import { useEffect } from 'react';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';

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
    // Show loading screen while fonts are loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'System' }}>
          Loading Conflict Connect...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </FirebaseAuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
