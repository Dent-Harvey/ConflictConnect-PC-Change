import { PressableScale } from '@/components/ui/PressableScale';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import { UserRole } from '@/types/auth';
import { errorHandler } from '@/utils/errorHandler';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmailVerificationScreen } from './EmailVerificationScreen';
import { ProfileSetupScreen } from './ProfileSetupScreen';

const AnimatedPressableScale = Animated.createAnimatedComponent(PressableScale);

export const ConflictController: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, user, pendingVerification, resetVerification } = useFirebaseAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show email verification screen if there's a pending verification
  if (pendingVerification) {
    return (
      <EmailVerificationScreen
        email={pendingVerification.email}
        onBack={() => {
          resetVerification();
          setSelectedRole(null);
          setEmail('');
          setPassword('');
        }}
      />
    );
  }

  // Show profile setup screen if user is authenticated but hasn't completed profile
  if (user && !user.hasCompletedProfile) {
    return <ProfileSetupScreen />;
  }

  const roles = [
    {
      id: 'scanner' as UserRole,
      title: 'Scanner',
      subtitle: 'Guest Access',
      description: 'View all conflict information and stay informed about global situations.',
      icon: '👁️',
      requirements: 'No account required',
    },
    {
      id: 'otg' as UserRole,
      title: 'On The Ground (OTG)',
      subtitle: 'Resource Requester',
      description: 'Request and view resources in your area. Share real-time updates from conflict zones.',
      icon: '🚨',
      requirements: 'Email + Location verification',
    },
    {
      id: 'hand' as UserRole,
      title: 'Hand',
      subtitle: 'Resource Provider',
      description: 'Add resources, fulfill requests, and connect with OTG users to provide aid.',
      icon: '🤝',
      requirements: 'Email + Location verification',
    },
    {
      id: 'conflict_controller' as UserRole,
      title: 'Conflict Controller',
      subtitle: 'Admin Access',
      description: 'Full administrative access to all systems - view resources, manage requests, add resources, view who has requested what and where.',
      icon: '🎛️',
      requirements: 'Password authentication required',
    },
  ];

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'scanner') {
      // Scanner doesn't need email, proceed immediately
      handleLogin(role);
    }
    // Reset form when changing roles
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (role: UserRole = selectedRole!) => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();

      if ((role === 'otg' || role === 'hand') && !email.trim()) {
        Alert.alert('Email Required', 'Please enter your email address to continue.');
        return;
      }

      if ((role === 'otg' || role === 'hand') && !isValidEmail(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      if (role === 'conflict_controller' && !password.trim()) {
        Alert.alert('Password Required', 'Please enter the conflict controller password.');
        return;
      }

      await login(role, email.trim() || undefined, password.trim() || undefined);
    } catch (error) {
      errorHandler({
        filePath: 'components/RoleSelectionScreen.tsx',
        functionName: 'handleLogin',
        error: error as Error
      });
      
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Location permission')) {
        Alert.alert(
          'Location Permission Required',
          'This role requires location access to verify your position and provide relevant resources.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => handleLogin(role) }
          ]
        );
      } else if (errorMessage.includes('Invalid password')) {
        Alert.alert(
          'Authentication Failed',
          'Invalid password for conflict controller access. Please check your credentials.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Login Failed', errorMessage || 'An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
          contentContainerStyle={{ padding: theme.spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.delay(200)}>
            <Text style={{
              fontSize: theme.fontSize['3xl'],
              fontWeight: '700',
              color: theme.colors.primary,
              textAlign: 'center',
              marginBottom: theme.spacing.md,
              fontFamily: 'Inter-Bold',
            }}>
              Conflict Controller
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.lg,
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: theme.spacing.xl,
              lineHeight: theme.fontSize.lg * 1.4,
              fontFamily: 'Inter-Regular',
            }}>
              Authenticate to access global conflict monitoring and crisis response systems
            </Text>
          </Animated.View>

          {roles.map((role, index) => (
            <AnimatedPressableScale
              key={role.id}
              entering={FadeInDown.delay(300 + index * 100)}
              onPress={() => handleRoleSelection(role.id)}
              disabled={isLoading}
              style={{
                backgroundColor: selectedRole === role.id ? theme.colors.primary + '10' : theme.colors.surface,
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
                borderWidth: selectedRole === role.id ? 2 : theme.hairlineWidth,
                borderColor: selectedRole === role.id ? theme.colors.primary : theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Text style={{ fontSize: 24, marginRight: theme.spacing.md }}>
                  {role.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: theme.fontSize.xl,
                    fontWeight: '600',
                    color: theme.colors.text,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                    {role.title}
                  </Text>
                  <Text style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.primary,
                    fontWeight: '500',
                    fontFamily: 'Inter-Medium',
                  }}>
                    {role.subtitle}
                  </Text>
                </View>
              </View>
              
              <Text style={{
                fontSize: theme.fontSize.base,
                color: theme.colors.textSecondary,
                lineHeight: theme.fontSize.base * 1.3,
                marginBottom: theme.spacing.sm,
                fontFamily: 'Inter-Regular',
              }}>
                {role.description}
              </Text>
              
              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textTertiary,
                fontStyle: 'italic',
                fontFamily: 'Inter-Regular',
              }}>
                {role.requirements}
              </Text>
            </AnimatedPressableScale>
          ))}

          {selectedRole && (selectedRole === 'otg' || selectedRole === 'hand' || selectedRole === 'conflict_controller') && (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                marginTop: theme.spacing.md,
              }}
            >
              {selectedRole === 'conflict_controller' ? (
                <>
                  <Text style={{
                    fontSize: theme.fontSize.lg,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                    Conflict Controller Password
                  </Text>
                  
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      fontSize: theme.fontSize.base,
                      color: theme.colors.text,
                      borderWidth: theme.hairlineWidth,
                      borderColor: theme.colors.border,
                      marginBottom: theme.spacing.lg,
                      fontFamily: 'Inter-Regular',
                    }}
                    placeholder="Enter admin password"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </>
              ) : (
                <>
                  <Text style={{
                    fontSize: theme.fontSize.lg,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: theme.spacing.md,
                    fontFamily: 'Inter-SemiBold',
                  }}>
                    Email Address
                  </Text>
                  
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.background,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      fontSize: theme.fontSize.base,
                      color: theme.colors.text,
                      borderWidth: theme.hairlineWidth,
                      borderColor: theme.colors.border,
                      marginBottom: theme.spacing.lg,
                      fontFamily: 'Inter-Regular',
                    }}
                    placeholder="Enter your email address"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </>
              )}

              <AnimatedPressableScale
                onPress={() => handleLogin()}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Text style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: '600',
                  color: theme.colors.surface,
                  fontFamily: 'Inter-SemiBold',
                }}>
                  {isLoading 
                    ? (selectedRole === 'conflict_controller' ? 'Authenticating...' : 'Verifying Location...') 
                    : 'Continue'
                  }
                </Text>
              </AnimatedPressableScale>

              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textTertiary,
                textAlign: 'center',
                marginTop: theme.spacing.md,
                lineHeight: theme.fontSize.sm * 1.3,
                fontFamily: 'Inter-Regular',
              }}>
                {selectedRole === 'conflict_controller' 
                  ? 'Administrative access provides full system control and oversight capabilities.'
                  : 'By continuing, you agree to share your location for verification and resource matching purposes.'
                }
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Export as RoleSelectionScreen for backward compatibility
export { ConflictController as RoleSelectionScreen };
