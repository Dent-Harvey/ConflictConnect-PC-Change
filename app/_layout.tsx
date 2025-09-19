import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // In a pure React Native app, you would load fonts differently
    // For now, we'll just mark them as loaded
    setFontsLoaded(true);
  }, []);

  if (!fontsLoaded) {
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
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={{ flex: 1 }}>
              {/* This will be replaced with the main app navigation */}
              <Text>App Layout Placeholder</Text>
            </View>
          </ThemeProvider>
        </FirebaseAuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
