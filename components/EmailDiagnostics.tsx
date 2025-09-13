import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { checkEmailServiceHealth, sendVerificationEmail, generateVerificationCode } from '@/services/backendEmailService';

export const EmailDiagnostics: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [diagnosticResults, setDiagnosticResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setDiagnosticResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  const clearResults = () => {
    setDiagnosticResults([]);
  };

  const testSMTPConnection = async () => {
    setIsLoading(true);
    addResult('🔍 Testing SMTP connection...');
    
    try {
      const isHealthy = await checkEmailServiceHealth();
      if (isHealthy) {
        addResult('✅ SMTP connection successful!');
      } else {
        addResult('❌ SMTP connection failed - check console logs for details');
      }
    } catch (error) {
      addResult(`❌ SMTP test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailSending = async () => {
    if (!testEmail.trim()) {
      Alert.alert('Error', 'Please enter a test email address');
      return;
    }

    if (!testEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    addResult(`📧 Testing email sending to: ${testEmail}`);
    
    try {
      const code = generateVerificationCode();
      addResult(`🎲 Generated verification code: ${code}`);
      
      const result = await sendVerificationEmail(testEmail, code);
      
      if (result.success) {
        addResult('✅ Email sent successfully!');
        addResult(`📝 Message: ${result.message}`);
        Alert.alert('Success', `Verification email sent to ${testEmail}!\n\nCheck your inbox and spam folder.\n\nVerification code: ${code}`);
      } else {
        addResult(`❌ Email sending failed: ${result.message}`);
        Alert.alert('Failed', result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addResult(`❌ Email test error: ${errorMessage}`);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const showConfiguration = () => {
    const config = `
📋 Current Email Configuration:
• Host: mail.privateemail.com
• Port: 465 (SSL)
• Username: conflictconnect@neffcreative.co
• Secure: Yes (SSL/TLS)

📧 Email Verification Flow:
• conflict_controller: No email verification
• scanner: No email verification  
• otg: Email verification required
• hand: Email verification required
    `;
    
    Alert.alert('Email Configuration', config);
    addResult('📋 Configuration displayed to user');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        📧 Email Service Diagnostics
      </Text>
      
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Test email functionality and diagnose delivery issues
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          SMTP Connection Test
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={testSMTPConnection}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background }]}>
            {isLoading ? '🔄 Testing...' : '🔍 Test SMTP Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Email Sending Test
        </Text>
        <TextInput
          style={[styles.input, { 
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text
          }]}
          placeholder="Enter test email address"
          placeholderTextColor={theme.colors.textSecondary}
          value={testEmail}
          onChangeText={setTestEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.success }]}
          onPress={testEmailSending}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background }]}>
            {isLoading ? '📤 Sending...' : '📧 Send Test Email'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Configuration
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={showConfiguration}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background }]}>
            📋 Show Configuration
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Diagnostic Results
          </Text>
          <TouchableOpacity onPress={clearResults}>
            <Text style={[styles.clearButton, { color: theme.colors.error }]}>
              🗑️ Clear
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={[styles.resultsContainer, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border 
          }]}
          showsVerticalScrollIndicator={true}
        >
          {diagnosticResults.length === 0 ? (
            <Text style={[styles.noResults, { color: theme.colors.textSecondary }]}>
              No diagnostic results yet. Run tests above to see results here.
            </Text>
          ) : (
            diagnosticResults.map((result, index) => (
              <Text 
                key={index} 
                style={[styles.resultText, { color: theme.colors.text }]}
                selectable={true}
              >
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
    minHeight: 100,
  },
  noResults: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    lineHeight: 16,
  },
});