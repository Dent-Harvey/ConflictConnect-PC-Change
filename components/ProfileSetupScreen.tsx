import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnhancedProfileSetup } from './EnhancedProfileSetup';

export const ProfileSetupScreen: React.FC = () => {
  const theme = useTheme();
  const { user, completeProfileSetup } = useFirebaseAuth();

  const handleComplete = async (profile: any) => {
    if (completeProfileSetup) {
      await completeProfileSetup(profile);
    }
  };

  const handleSkip = async () => {
    // Skip profile setup by completing with minimal required data
    if (completeProfileSetup) {
      await completeProfileSetup({
        firstName: 'User',
        lastName: 'Name',
        email: user?.email || '',
        location: {
          latitude: 0,
          longitude: 0,
          address: 'Not provided',
          city: '',
          country: ''
        },
        languages: ['en'],
        preferredLanguage: 'en',
        showLocation: false,
        showContactInfo: false,
        allowMessaging: false
      });
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