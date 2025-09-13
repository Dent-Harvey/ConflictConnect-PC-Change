import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Modal, 
  Alert,
  StyleSheet,
  Keyboard,
  Platform
} from 'react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DeveloperLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeveloperLoginModal: React.FC<DeveloperLoginModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [developerCode, setDeveloperCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const CORRECT_CODE = 'letshelp';

  const handleSubmit = async () => {
    if (!developerCode.trim()) return;
    
    console.log('Developer login attempt:', developerCode.toLowerCase().trim());
    setIsVerifying(true);
    Keyboard.dismiss();

    // Small delay to show verification state
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (developerCode.toLowerCase().trim() === CORRECT_CODE) {
        console.log('Developer login successful');
        setDeveloperCode('');
        setIsVerifying(false);
        onSuccess();
        onClose();
        
        Alert.alert(
          'Access Granted! ✅',
          'Developer access verified. You can now export the complete source code.',
          [{ text: 'Continue' }]
        );
      } else {
        console.log('Developer login failed - incorrect code');
        setIsVerifying(false);
        Alert.alert(
          'Access Denied ❌',
          'Invalid developer reference code. Please contact the development team for the correct code.',
          [{ text: 'Try Again' }]
        );
        setDeveloperCode('');
      }
    } catch (error) {
      console.error('Developer login error:', error);
      setIsVerifying(false);
      Alert.alert(
        'Error',
        'Something went wrong during verification. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClose = () => {
    setDeveloperCode('');
    setIsVerifying(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : 'pageSheet'}
      onRequestClose={handleClose}
    >
      <View style={[
        styles.container,
        { 
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16
        }
      ]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Developer Access Required
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Please enter the developer reference code to export source code
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Enter Developer Reference
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              value={developerCode}
              onChangeText={setDeveloperCode}
              placeholder="Developer reference code"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isVerifying}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PressableScale
              onPress={handleSubmit}
              disabled={!developerCode.trim() || isVerifying}
              style={[
                styles.verifyButton,
                {
                  backgroundColor: (!developerCode.trim() || isVerifying) 
                    ? theme.colors.muted 
                    : theme.colors.primary,
                }
              ]}
            >
              <Text style={[
                styles.verifyButtonText,
                {
                  color: (!developerCode.trim() || isVerifying) 
                    ? theme.colors.textSecondary 
                    : theme.colors.onPrimary
                }
              ]}>
                {isVerifying ? 'VERIFYING...' : 'VERIFY ACCESS'}
              </Text>
            </PressableScale>

            <PressableScale
              onPress={handleClose}
              disabled={isVerifying}
              style={[
                styles.cancelButton,
                { 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface
                }
              ]}
            >
              <Text style={[
                styles.cancelButtonText,
                { color: theme.colors.text }
              ]}>
                Cancel
              </Text>
            </PressableScale>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            🔒 Developer access protects source code exports
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.textSecondary }]}>
            Contact the development team if you need access
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: 'center',
    letterSpacing: 2,
  },
  buttonContainer: {
    gap: 12,
  },
  verifyButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
});