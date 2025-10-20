import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import React from 'react';
import { OnboardingFlow, useOnboardingStatus } from './OnboardingFlow';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * AuthenticationFlow - Wrapper that shows onboarding and authentication
 * Shows welcome screens → role selection → email verification → profile setup → role-specific walkthrough
 */
export const AuthenticationFlow: React.FC = () => {
  const { user, isLoading, needsProfileSetup } = useFirebaseAuth();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingStatus();

  // Show loading state
  if (isLoading || onboardingLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // If user is authenticated, has complete profile, and has seen onboarding, don't show auth flow
  if (user && !needsProfileSetup && !needsOnboarding) {
    return null; // Let the main app render
  }

  // Show onboarding flow which handles: welcome → role selection → verification → profile → walkthrough
  return <OnboardingFlow />;
};
