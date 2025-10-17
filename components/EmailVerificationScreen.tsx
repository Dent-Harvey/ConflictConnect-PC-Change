import { PressableScale } from '@/components/ui/PressableScale';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import { validateVerificationCode } from '@/services/firebaseEmailService';
import { errorHandler } from '@/utils/errorHandler';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInUp,
    LinearTransition,
    SlideInRight
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressableScale = Animated.createAnimatedComponent(PressableScale);

interface EmailVerificationScreenProps {
  email: string;
  onBack: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ 
  email, 
  onBack 
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { sendVerificationCode, verifyEmailCode } = useFirebaseAuth();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Send initial verification code when component mounts
  useEffect(() => {
    sendInitialCode();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendInitialCode = async () => {
    try {
      setIsLoading(true);
      console.log('[EMAIL_VERIFICATION] Sending initial verification code');
      if (!sendVerificationCode) {
        throw new Error('Verification code function not available');
      }
      const generatedCode = await sendVerificationCode(email);
      setVerificationCode(generatedCode);
      
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      errorHandler({
        filePath: 'components/EmailVerificationScreen.tsx',
        functionName: 'sendInitialCode',
        error: error as Error
      });
      
      Alert.alert(
        'Email Send Failed',
        'Could not send verification email. Please try again or go back.',
        [
          { text: 'Try Again', onPress: sendInitialCode },
          { text: 'Go Back', onPress: onBack, style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) return; // Only allow single digit
    
    const newCode = code.split('');
    newCode[index] = digit;
    const updatedCode = newCode.join('');
    
    setCode(updatedCode);
    
    // Auto-move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    
    // Auto-verify when all 6 digits are entered
    if (updatedCode.length === 6 && validateVerificationCode(updatedCode)) {
      handleVerifyCode(updatedCode);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerifyCode = async (codeToVerify: string = code) => {
    try {
      if (!validateVerificationCode(codeToVerify)) {
        Alert.alert('Invalid Code', 'Please enter a 6-digit verification code.');
        return;
      }

      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (!verifyEmailCode) {
        throw new Error('Verification function not available');
      }
      await verifyEmailCode(codeToVerify, verificationCode);
      
      // Success - the AuthContext will handle navigation
      console.log('[EMAIL_VERIFICATION] Verification successful');
    } catch (error) {
      errorHandler({
        filePath: 'components/EmailVerificationScreen.tsx',
        functionName: 'handleVerifyCode',
        error: error as Error
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Clear the code on error
      setCode('');
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
      
      const errorMessage = (error as Error).message;
      Alert.alert(
        'Verification Failed',
        errorMessage || 'Invalid verification code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      console.log('[EMAIL_VERIFICATION] Resending verification code');
      
      if (!sendVerificationCode) {
        throw new Error('Verification code function not available');
      }
      const newCode = await sendVerificationCode(email);
      setVerificationCode(newCode);
      setTimeLeft(600); // Reset timer
      setCode('');
      
      // Focus first input
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      errorHandler({
        filePath: 'components/EmailVerificationScreen.tsx',
        functionName: 'handleResendCode',
        error: error as Error
      });
      
      Alert.alert(
        'Resend Failed',
        'Could not resend verification code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            justifyContent: 'center',
            minHeight: '80%'
          }}
          keyboardShouldPersistTaps="handled"
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
              <Text style={{ fontSize: 32 }}>📧</Text>
            </Animated.View>
            
            <Text style={{
              fontSize: theme.fontSize['2xl'],
              fontWeight: '700',
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: theme.spacing.sm,
              fontFamily: 'Inter-Bold',
            }}>
              Verify Your Email
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.base,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: theme.fontSize.base * 1.4,
              fontFamily: 'Inter-Regular',
            }}>
              Happy to Help? Enter the below code sent to
            </Text>
            
            <Text style={{
              fontSize: theme.fontSize.base,
              color: theme.colors.primary,
              textAlign: 'center',
              fontWeight: '600',
              marginTop: theme.spacing.xs,
              fontFamily: 'Inter-SemiBold',
            }}>
              {email}
            </Text>
          </Animated.View>

          {/* Code Input Fields */}
          <Animated.View
            entering={FadeInUp.delay(600)}
            layout={LinearTransition}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.md,
              marginBottom: theme.spacing.xl,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Animated.View
                key={index}
                entering={SlideInRight.delay(700 + index * 50)}
              >
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={{
                    width: 45,
                    height: 55,
                    borderWidth: 2,
                    borderColor: focusedIndex === index 
                      ? theme.colors.primary 
                      : code[index] 
                        ? theme.colors.success 
                        : theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: code[index] 
                      ? theme.colors.success + '10' 
                      : theme.colors.surface,
                    textAlign: 'center',
                    fontSize: theme.fontSize.xl,
                    fontWeight: '700',
                    color: theme.colors.text,
                    fontFamily: 'Inter-Bold',
                  }}
                  value={code[index] || ''}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="numeric"
                  maxLength={1}
                  editable={!isLoading}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              </Animated.View>
            ))}
          </Animated.View>

          {/* Timer */}
          <Animated.View
            entering={FadeInUp.delay(800)}
            style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}
          >
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: timeLeft > 0 ? theme.colors.textSecondary : theme.colors.error,
              fontFamily: 'Inter-Medium',
            }}>
              {timeLeft > 0 
                ? `Code expires in ${formatTime(timeLeft)}`
                : 'Code has expired'
              }
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInUp.delay(1000)}>
            <AnimatedPressableScale
              onPress={() => handleVerifyCode()}
              disabled={isLoading || code.length !== 6}
              style={{
                backgroundColor: code.length === 6 ? theme.colors.primary : theme.colors.muted,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                opacity: (isLoading || code.length !== 6) ? 0.6 : 1,
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
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text style={{
                  fontSize: theme.fontSize.base,
                  fontWeight: '600',
                  color: code.length === 6 ? theme.colors.surface : theme.colors.textSecondary,
                  fontFamily: 'Inter-SemiBold',
                }}>
                  Verify Code
                </Text>
              )}
            </AnimatedPressableScale>

            <AnimatedPressableScale
              onPress={handleResendCode}
              disabled={isResending || timeLeft > 540} // Can resend after 1 minute
              style={{
                borderWidth: theme.hairlineWidth,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.md,
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                opacity: (isResending || timeLeft > 540) ? 0.6 : 1,
              }}
            >
              {isResending ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={{
                    fontSize: theme.fontSize.base,
                    color: theme.colors.primary,
                    marginLeft: theme.spacing.sm,
                    fontFamily: 'Inter-Medium',
                  }}>
                    Sending...
                  </Text>
                </View>
              ) : (
                <Text style={{
                  fontSize: theme.fontSize.base,
                  color: timeLeft > 540 ? theme.colors.textSecondary : theme.colors.primary,
                  fontFamily: 'Inter-Medium',
                }}>
                  {timeLeft > 540 
                    ? `Resend available in ${formatTime(timeLeft - 540)}`
                    : 'Resend Code'
                  }
                </Text>
              )}
            </AnimatedPressableScale>

            <AnimatedPressableScale
              onPress={onBack}
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
                ← Back to login
              </Text>
            </AnimatedPressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};