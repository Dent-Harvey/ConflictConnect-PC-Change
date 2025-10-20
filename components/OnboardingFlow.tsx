import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { UserRole } from '@/types/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HandWalkthrough } from './HandWalkthrough';
import { OTGWalkthrough } from './OTGWalkthrough';
import { ProfileSetupScreen } from './ProfileSetupScreen';
import { RoleExplanationScreen } from './RoleExplanationScreen';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { WelcomeScreen } from './WelcomeScreen';

const { width } = Dimensions.get('window');

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useFirebaseAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setHasSeenOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setHasSeenOnboarding(true);
      onComplete?.();
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  };

  // If user has seen onboarding and is authenticated, skip to role-specific content
  if (hasSeenOnboarding && user) {
    // Show walkthrough for OTG and Hand users after role selection
    if (user.role === 'otg' && !user.hasCompletedProfile) {
      return <OTGWalkthrough onComplete={markOnboardingComplete} />;
    }
    if (user.role === 'hand' && !user.hasCompletedProfile) {
      return <HandWalkthrough onComplete={markOnboardingComplete} />;
    }
    // For scanner and admin, or users with completed profiles, skip onboarding
    return null;
  }

  // If user hasn't seen initial onboarding AND is not authenticated, show welcome screens
  if (!hasSeenOnboarding && !user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={(event) => {
            const newScreen = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentScreen(newScreen);
            
            // After role selection (screen 3), check if user is authenticated
            if (newScreen === 2 && user) {
              // User authenticated, mark first part as complete
              markOnboardingComplete();
            }
          }}
          contentContainerStyle={{ width: width * 3 }}
        >
          {/* Screen 1: Welcome */}
          <View style={{ width, height: '100%' }}>
            <WelcomeScreen />
          </View>

          {/* Screen 2: Role Explanation */}
          <View style={{ width, height: '100%' }}>
            <RoleExplanationScreen />
          </View>

          {/* Screen 3: Role Selection */}
          <View style={{ width, height: '100%' }}>
            <RoleSelectionScreen />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // After initial onboarding, show role-specific flows
  if (user) {
    // Profile setup for OTG and Hand users
    if (!user.hasCompletedProfile && (user.role === 'otg' || user.role === 'hand')) {
      return <ProfileSetupScreen />;
    }

    // Role-specific walkthrough
    if (user.role === 'otg') {
      return <OTGWalkthrough onComplete={markOnboardingComplete} />;
    }
    if (user.role === 'hand') {
      return <HandWalkthrough onComplete={markOnboardingComplete} />;
    }
  }

  // Default: show role selection
  return <RoleSelectionScreen />;
};

// Helper hook to check if user needs onboarding
export const useOnboardingStatus = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      
      // User needs onboarding if:
      // 1. They haven't seen the welcome screens
      // 2. They're authenticated but haven't completed their profile (OTG/Hand)
      // 3. They're OTG/Hand and haven't seen the walkthrough
      const hasSeenWelcome = completed === 'true';
      const needsProfile = user && !user.hasCompletedProfile && (user.role === 'otg' || user.role === 'hand');
      
      setNeedsOnboarding(!hasSeenWelcome || !!needsProfile);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true); // Default to showing onboarding on error
    } finally {
      setIsLoading(false);
    }
  };

  return { needsOnboarding, isLoading };
};

