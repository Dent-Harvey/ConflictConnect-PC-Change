import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import React from 'react';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * AuthenticationFlow - Simplified wrapper for authentication
 * The RoleSelectionScreen manages the entire auth flow internally
 */
export const AuthenticationFlow: React.FC = () => {
  const { user, isLoading, needsProfileSetup } = useFirebaseAuth();

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // If user is authenticated and has complete profile, don't show auth flow
  if (user && !needsProfileSetup) {
    return null; // Let the main app render
  }

  // RoleSelectionScreen handles the entire flow: role selection → verification → profile setup
  return <RoleSelectionScreen />;
};
