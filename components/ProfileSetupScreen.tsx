import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeIn, 
  SlideInRight,
  LinearTransition,
  FadeInUp
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/auth';
import { useTheme } from '@/hooks/useTheme';
import { errorHandler } from '@/utils/errorHandler';

const AnimatedPressableScale = Animated.createAnimatedComponent(PressableScale);

const EXPERTISE_OPTIONS = [
  'Medical/Healthcare',
  'Emergency Response',
  'Logistics/Supply Chain',
  'Transportation',
  'Communication/Tech',
  'Security/Safety',
  'Mental Health Support',
  'Language Translation',
  'Legal/Administrative',
  'Construction/Engineering',
  'Food/Nutrition',
  'Education/Training',
];

const AVAILABILITY_OPTIONS: { 
  value: UserProfile['availability'], 
  label: string, 
  description: string 
}[] = [
  {
    value: 'emergency_only',
    label: 'Emergency Only',
    description: 'Available during critical emergency situations'
  },
  {
    value: 'weekends',
    label: 'Weekends',
    description: 'Available during weekends and holidays'
  },
  {
    value: 'part_time',
    label: 'Part Time',
    description: 'Available several hours per week'
  },
  {
    value: 'full_time',
    label: 'Full Time',
    description: 'Available most days and hours'
  },
];

export const ProfileSetupScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { updateProfile, skipProfile, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<UserProfile['availability']>('part_time');

  const handleSubmitProfile = async () => {
    try {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert(
          'Required Fields Missing', 
          'Please complete all required fields:\n\n• First Name\n• Last Name\n\nYour email and location were already verified during sign-up.'
        );
        return;
      }

      setIsLoading(true);
      Keyboard.dismiss();
      
      const profile: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organization: organization.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        bio: bio.trim() || undefined,
        expertise: selectedExpertise.length > 0 ? selectedExpertise : undefined,
        availability: selectedAvailability,
      };

      console.log('[PROFILE_SETUP] Creating profile:', profile);
      await updateProfile(profile);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
    } catch (error) {
      errorHandler({
        filePath: 'components/ProfileSetupScreen.tsx',
        functionName: 'handleSubmitProfile',
        error: error as Error
      });
      
      Alert.alert(
        'Profile Creation Failed',
        'Could not create your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipProfile = async () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can create your profile later, but note that requesting or providing resources requires a complete profile.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        {
          text: 'Skip for Now',
          style: 'default',
          onPress: async () => {
            try {
              await skipProfile();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              errorHandler({
                filePath: 'components/ProfileSetupScreen.tsx',
                functionName: 'handleSkipProfile',
                error: error as Error
              });
              
              Alert.alert('Error', 'Could not skip profile setup. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise(prev => {
      if (prev.includes(expertise)) {
        return prev.filter(e => e !== expertise);
      } else {
        return [...prev, expertise];
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAvailabilitySelect = (availability: UserProfile['availability']) => {
    setSelectedAvailability(availability);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 24}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xl
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeIn.delay(200)}
            style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}
          >
            <Animated.View
              entering={SlideInRight.delay(400)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <Text style={{ fontSize: 32 }}>👤</Text>
            </Animated.View>
            
            <Text style={{
              fontSize: theme.fontSize['2xl'],
              fontWeight: '700',
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: theme.spacing.sm,
              fontFamily: 'Inter-Bold',
            }}>
              Create Your Profile
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.base,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: theme.fontSize.base * 1.4,
              fontFamily: 'Inter-Regular',
            }}>
              Help others understand how you can contribute to relief efforts
            </Text>

            {/* Show verified email and location */}
            {user && (
              <Animated.View 
                entering={FadeInUp.delay(600)}
                style={{
                  backgroundColor: theme.colors.success + '15',
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  marginTop: theme.spacing.lg,
                  borderWidth: theme.hairlineWidth,
                  borderColor: theme.colors.success + '30',
                  alignSelf: 'stretch',
                }}
              >
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: '600',
                  color: theme.colors.success,
                  marginBottom: theme.spacing.xs,
                  fontFamily: 'Inter-SemiBold',
                  textAlign: 'center',
                }}>
                  ✅ Already Verified
                </Text>
                
                <View style={{ gap: theme.spacing.xs }}>
                  {user.email && (
                    <Text style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.text,
                      fontFamily: 'Inter-Medium',
                      textAlign: 'center',
                    }}>
                      📧 {user.email}
                    </Text>
                  )}
                  
                  {user.location?.address && (
                    <Text style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.text,
                      fontFamily: 'Inter-Medium',
                      textAlign: 'center',
                    }}>
                      📍 {user.location.address}
                    </Text>
                  )}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Basic Information */}
          <Animated.View entering={FadeInUp.delay(800)} style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{
              fontSize: theme.fontSize.lg,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontFamily: 'Inter-SemiBold',
            }}>
              Basic Information
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
              fontFamily: 'Inter-Regular',
            }}>
              Complete your profile with the required information below
            </Text>

            <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.xs,
                  fontFamily: 'Inter-Medium',
                }}>
                  First Name{' '}
                  <Text style={{ color: theme.colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    fontSize: theme.fontSize.base,
                    color: theme.colors.text,
                    borderWidth: theme.hairlineWidth,
                    borderColor: theme.colors.border,
                    fontFamily: 'Inter-Regular',
                  }}
                  placeholder="e.g., John"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.xs,
                  fontFamily: 'Inter-Medium',
                }}>
                  Last Name{' '}
                  <Text style={{ color: theme.colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    fontSize: theme.fontSize.base,
                    color: theme.colors.text,
                    borderWidth: theme.hairlineWidth,
                    borderColor: theme.colors.border,
                    fontFamily: 'Inter-Regular',
                  }}
                  placeholder="e.g., Smith"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
                fontFamily: 'Inter-Medium',
              }}>
                Organization (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  fontSize: theme.fontSize.base,
                  color: theme.colors.text,
                  borderWidth: theme.hairlineWidth,
                  borderColor: theme.colors.border,
                  fontFamily: 'Inter-Regular',
                }}
                placeholder="e.g., Red Cross, UN, Doctors Without Borders"
                placeholderTextColor={theme.colors.textTertiary}
                value={organization}
                onChangeText={setOrganization}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
                fontFamily: 'Inter-Medium',
              }}>
                Phone Number (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  fontSize: theme.fontSize.base,
                  color: theme.colors.text,
                  borderWidth: theme.hairlineWidth,
                  borderColor: theme.colors.border,
                  fontFamily: 'Inter-Regular',
                }}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={theme.colors.textTertiary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </Animated.View>

          {/* Availability */}
          <Animated.View entering={FadeInUp.delay(900)} style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{
              fontSize: theme.fontSize.lg,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: theme.spacing.md,
              fontFamily: 'Inter-SemiBold',
            }}>
              Availability
            </Text>

            {AVAILABILITY_OPTIONS.map((option, index) => (
              <AnimatedPressableScale
                key={option.value}
                entering={FadeInUp.delay(750 + index * 50)}
                onPress={() => handleAvailabilitySelect(option.value)}
                disabled={isLoading}
                style={{
                  backgroundColor: selectedAvailability === option.value 
                    ? theme.colors.primary + '15' 
                    : theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                  borderWidth: selectedAvailability === option.value ? 2 : theme.hairlineWidth,
                  borderColor: selectedAvailability === option.value 
                    ? theme.colors.primary 
                    : theme.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedAvailability === option.value 
                      ? theme.colors.primary 
                      : theme.colors.border,
                    backgroundColor: selectedAvailability === option.value 
                      ? theme.colors.primary 
                      : 'transparent',
                    marginRight: theme.spacing.md,
                  }} />
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: theme.fontSize.base,
                      fontWeight: '600',
                      color: theme.colors.text,
                      marginBottom: 2,
                      fontFamily: 'Inter-SemiBold',
                    }}>
                      {option.label}
                    </Text>
                    <Text style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.textSecondary,
                      fontFamily: 'Inter-Regular',
                    }}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </AnimatedPressableScale>
            ))}
          </Animated.View>

          {/* Expertise */}
          <Animated.View entering={FadeInUp.delay(1000)} style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{
              fontSize: theme.fontSize.lg,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontFamily: 'Inter-SemiBold',
            }}>
              Areas of Expertise (Optional)
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
              fontFamily: 'Inter-Regular',
            }}>
              Select all that apply to help match you with relevant requests
            </Text>

            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.md
            }}>
              {EXPERTISE_OPTIONS.map((expertise, index) => (
                <AnimatedPressableScale
                  key={expertise}
                  entering={FadeInUp.delay(850 + index * 30)}
                  layout={LinearTransition}
                  onPress={() => toggleExpertise(expertise)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: selectedExpertise.includes(expertise) 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderRadius: 9999, // Full border radius
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderWidth: theme.hairlineWidth,
                    borderColor: selectedExpertise.includes(expertise) 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  }}
                >
                  <Text style={{
                    fontSize: theme.fontSize.sm,
                    color: selectedExpertise.includes(expertise) 
                      ? theme.colors.surface 
                      : theme.colors.text,
                    fontFamily: 'Inter-Medium',
                  }}>
                    {expertise}
                  </Text>
                </AnimatedPressableScale>
              ))}
            </View>
          </Animated.View>

          {/* Bio */}
          <Animated.View entering={FadeInUp.delay(1100)} style={{ marginBottom: theme.spacing.xl }}>
            <Text style={{
              fontSize: theme.fontSize.lg,
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              fontFamily: 'Inter-SemiBold',
            }}>
              Bio (Optional)
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
              fontFamily: 'Inter-Regular',
            }}>
              Tell others about your experience and how you can help
            </Text>

            <TextInput
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                fontSize: theme.fontSize.base,
                color: theme.colors.text,
                borderWidth: theme.hairlineWidth,
                borderColor: theme.colors.border,
                height: 100,
                textAlignVertical: 'top',
                fontFamily: 'Inter-Regular',
              }}
              placeholder="I have 5 years of experience in emergency response and can provide medical assistance..."
              placeholderTextColor={theme.colors.textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInUp.delay(1200)}>
            <AnimatedPressableScale
              onPress={handleSubmitProfile}
              disabled={isLoading || !firstName.trim() || !lastName.trim()}
              style={{
                backgroundColor: (!firstName.trim() || !lastName.trim()) 
                  ? theme.colors.muted 
                  : theme.colors.primary,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.colors.surface} />
                  <Text style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: '600',
                    color: theme.colors.surface,
                    marginLeft: theme.spacing.sm,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                    Creating Profile...
                  </Text>
                </View>
              ) : (
                <Text style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: '600',
                  color: (!firstName.trim() || !lastName.trim()) 
                    ? theme.colors.textSecondary 
                    : theme.colors.surface,
                  fontFamily: 'Inter-SemiBold',
                }}>
                  Create Profile
                </Text>
              )}
            </AnimatedPressableScale>

            <AnimatedPressableScale
              onPress={handleSkipProfile}
              disabled={isLoading}
              style={{
                alignItems: 'center',
                padding: theme.spacing.sm,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textTertiary,
                fontFamily: 'Inter-Regular',
              }}>
                Skip for now
              </Text>
            </AnimatedPressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};