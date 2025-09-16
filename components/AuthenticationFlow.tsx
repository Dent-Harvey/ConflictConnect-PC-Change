import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import { UserRole } from '@/types/auth';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { EmailVerificationScreen } from './EmailVerificationScreen';
import { ProfileSetupScreen } from './ProfileSetupScreen';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export const AuthenticationFlow: React.FC = () => {
  const { 
    user, 
    isLoading, 
    pendingVerification, 
    needsProfileSetup,
    login,
    verifyEmailAndCreateUser,
    completeProfileSetup,
    resetVerification
  } = useFirebaseAuth();
  
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState<'role' | 'verification' | 'profile'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('civilian');
  const [userEmail, setUserEmail] = useState<string>('');

  // Handle role selection
  const handleRoleSelection = async (role: UserRole, email?: string, password?: string) => {
    try {
      setSelectedRole(role);
      
      if (role === 'conflict_controller') {
        // Direct login for conflict controllers
        await login(role, email, password);
        setCurrentStep('profile'); // Skip verification for conflict controllers
      } else {
        // Email verification for civilians
        if (!email) {
          Alert.alert('Error', 'Email is required for civilian authentication');
          return;
        }
        
        setUserEmail(email);
        const result = await login(role, email);
        
        if (typeof result === 'object' && 'verificationCode' in result) {
          setCurrentStep('verification');
        }
      }
    } catch (error) {
      console.error('Role selection error:', error);
      Alert.alert('Authentication Error', error instanceof Error ? error.message : 'An error occurred during authentication');
    }
  };

  // Handle email verification
  const handleEmailVerification = async (code: string) => {
    try {
      if (!pendingVerification) {
        Alert.alert('Error', 'No pending verification found');
        return;
      }

      await verifyEmailAndCreateUser(pendingVerification.email, code, pendingVerification.role);
      setCurrentStep('profile');
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('Verification Error', error instanceof Error ? error.message : 'Invalid verification code');
    }
  };

  // Handle profile setup completion
  const handleProfileComplete = async (profileData: any) => {
    try {
      await completeProfileSetup(profileData);
      // Profile setup complete - user will be automatically redirected to main app
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Profile Setup Error', error instanceof Error ? error.message : 'Failed to complete profile setup');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('role');
      resetVerification();
    } else if (currentStep === 'profile') {
      if (selectedRole === 'conflict_controller') {
        setCurrentStep('role');
      } else {
        setCurrentStep('verification');
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // If user is authenticated and has complete profile, don't show auth flow
  if (user && !needsProfileSetup) {
    return null; // Let the main app render
  }

  // Render appropriate step
  switch (currentStep) {
    case 'role':
      return (
        <RoleSelectionScreen 
          onRoleSelect={handleRoleSelection}
          theme={theme}
        />
      );

    case 'verification':
      return (
        <EmailVerificationScreen
          email={pendingVerification?.email || userEmail}
          onVerify={handleEmailVerification}
          onBack={handleBack}
          onResendCode={() => {
            if (pendingVerification) {
              handleRoleSelection(pendingVerification.role, pendingVerification.email);
            }
          }}
        />
      );

    case 'profile':
      return (
        <ProfileSetupScreen
          initialRole={selectedRole}
          initialEmail={userEmail}
          onComplete={handleProfileComplete}
          onSkip={() => {
            // Handle skip if needed
            console.log('Profile setup skipped');
          }}
          onBack={handleBack}
        />
      );

    default:
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>Invalid authentication state</ThemedText>
        </ThemedView>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});
