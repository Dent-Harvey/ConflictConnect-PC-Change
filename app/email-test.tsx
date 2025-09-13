import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmailDiagnostics } from '@/components/EmailDiagnostics';
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';

export default function EmailTestScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: 'Email Diagnostics',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
        }}
      />
      <EmailDiagnostics />
    </SafeAreaView>
  );
}