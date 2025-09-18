import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnhancedProfileSetup } from './EnhancedProfileSetup';

export const ProfileSetupScreen: React.FC = () => {
  const theme = useTheme();
  const { updateProfile, skipProfile, user } = useFirebaseAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <EnhancedProfileSetup
        onComplete={updateProfile}
        onSkip={skipProfile}
        initialData={user?.profile}
      />
    </SafeAreaView>
  );
};