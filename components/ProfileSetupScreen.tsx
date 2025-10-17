import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnhancedProfileSetup } from './EnhancedProfileSetup';

export const ProfileSetupScreen: React.FC = () => {
  const theme = useTheme();
  const { updateProfile, skipProfile, user, completeProfileSetup } = useFirebaseAuth();

  const handleComplete = async (profile: any) => {
    if (completeProfileSetup) {
      await completeProfileSetup(profile);
    } else if (updateProfile) {
      await updateProfile(profile);
    }
  };

  const handleSkip = async () => {
    if (skipProfile) {
      await skipProfile();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <EnhancedProfileSetup
        onComplete={handleComplete}
        onSkip={handleSkip}
        initialData={user?.profile}
      />
    </SafeAreaView>
  );
};