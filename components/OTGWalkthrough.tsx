import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface WalkthroughStep {
  title: string;
  description: string;
  icon: string;
  action: string;
  tip?: string;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    title: 'Report a Conflict',
    icon: '📍',
    description: 'Tap the + button on the Operations screen to report a new conflict or update existing ones with real-time information.',
    action: 'Bottom right corner → Add Conflict',
    tip: 'Include photos, videos, and geolocation for verification',
  },
  {
    title: 'Request Resources',
    icon: '📦',
    description: 'Submit resource needs directly from the Needs screen. Specify what you need, quantity, and urgency level.',
    action: 'Needs tab → Add Need → Fill details',
    tip: 'Be specific about quantities and urgency to get faster responses',
  },
  {
    title: 'Track Your Requests',
    icon: '📊',
    description: 'Monitor the status of your resource requests and see who can fulfill them in real-time.',
    action: 'Needs tab → View your submitted needs',
    tip: 'Check regularly for responses from Hand users offering help',
  },
  {
    title: 'Connect with Providers',
    icon: '💬',
    description: 'When a Hand user responds to your need, you\'ll be able to coordinate directly for resource delivery.',
    action: 'Tap on matched needs to see provider details',
    tip: 'Share safe meeting locations and verify identities',
  },
  {
    title: 'View the Map',
    icon: '🗺️',
    description: 'See all conflicts, resources, and needs on an interactive map to understand the situation in your area.',
    action: 'Operations tab → View map',
    tip: 'Zoom in to see nearby resources and other OTG users',
  },
];

export const OTGWalkthrough: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = walkthroughSteps[currentStep];

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
    }}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(200)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing['2xl'] }}>
          <Text style={{
            fontSize: theme.fontSize['2xl'],
            fontWeight: '700',
            color: theme.colors.primary,
            fontFamily: 'Inter-Bold',
          }}>
            OTG Guide
          </Text>
          <PressableScale onPress={handleSkip}>
            <Text style={{
              fontSize: theme.fontSize.base,
              color: theme.colors.textSecondary,
              fontFamily: 'Inter-Medium',
            }}>
              Skip
            </Text>
          </PressableScale>
        </View>
      </Animated.View>

      {/* Progress Indicators */}
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          marginBottom: theme.spacing['2xl'],
          gap: theme.spacing.sm,
        }}
      >
        {walkthroughSteps.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === currentStep ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === currentStep ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </Animated.View>

      {/* Content */}
      <Animated.View 
        key={currentStep}
        entering={FadeInRight.springify()}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', marginBottom: theme.spacing['2xl'] }}>
          <Text style={{ fontSize: 72, marginBottom: theme.spacing.lg }}>
            {step.icon}
          </Text>
          <Text style={{
            fontSize: theme.fontSize['2xl'],
            fontWeight: '700',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
            fontFamily: 'Inter-Bold',
          }}>
            {step.title}
          </Text>
        </View>

        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
        }}>
          <Text style={{
            fontSize: theme.fontSize.lg,
            color: theme.colors.text,
            lineHeight: theme.fontSize.lg * 1.5,
            marginBottom: theme.spacing.lg,
            fontFamily: 'Inter-Regular',
          }}>
            {step.description}
          </Text>

          {/* Action Steps */}
          <View style={{
            backgroundColor: theme.colors.primary + '15',
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginBottom: step.tip ? theme.spacing.md : 0,
          }}>
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textTertiary,
              marginBottom: theme.spacing.xs,
              fontFamily: 'Inter-Medium',
            }}>
              How to do it:
            </Text>
            <Text style={{
              fontSize: theme.fontSize.base,
              color: theme.colors.primary,
              fontWeight: '600',
              fontFamily: 'Inter-SemiBold',
            }}>
              {step.action}
            </Text>
          </View>

          {step.tip && (
            <View style={{
              backgroundColor: theme.colors.warning + '15',
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
              <Text style={{ fontSize: 20, marginRight: theme.spacing.sm }}>💡</Text>
              <Text style={{
                flex: 1,
                fontSize: theme.fontSize.sm,
                color: theme.colors.text,
                fontFamily: 'Inter-Regular',
              }}>
                <Text style={{ fontWeight: '600', fontFamily: 'Inter-SemiBold' }}>Tip: </Text>
                {step.tip}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Navigation */}
      <Animated.View entering={FadeInDown.delay(400)}>
        <PressableScale
          onPress={handleNext}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            alignItems: 'center',
            marginTop: theme.spacing.xl,
          }}
        >
          <Text style={{
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            color: theme.colors.surface,
            fontFamily: 'Inter-SemiBold',
          }}>
            {currentStep < walkthroughSteps.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </PressableScale>

        <Text style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.textTertiary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
          fontFamily: 'Inter-Regular',
        }}>
          {currentStep + 1} of {walkthroughSteps.length}
        </Text>
      </Animated.View>
    </View>
  );
};

