import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  conflictZone?: string;
}

const LANGUAGES: Language[] = [
  // Global Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  
  // Eastern Europe Conflict Zone
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', conflictZone: 'Eastern Europe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', conflictZone: 'Eastern Europe' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾', conflictZone: 'Eastern Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', conflictZone: 'Eastern Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', conflictZone: 'Eastern Europe' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', conflictZone: 'Eastern Europe' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', conflictZone: 'Eastern Europe' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', conflictZone: 'Eastern Europe' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', conflictZone: 'Eastern Europe' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', conflictZone: 'Eastern Europe' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', conflictZone: 'Eastern Europe' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', conflictZone: 'Eastern Europe' },
  
  // Middle East Conflict Zone
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', conflictZone: 'Middle East' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', conflictZone: 'Middle East' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', conflictZone: 'Middle East' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', conflictZone: 'Middle East' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', flag: '🇮🇶', conflictZone: 'Middle East' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', conflictZone: 'Middle East' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇵🇰', conflictZone: 'Middle East' },
  
  // South Asia Conflict Zone
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', conflictZone: 'South Asia' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', conflictZone: 'South Asia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', conflictZone: 'South Asia' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇱🇰', conflictZone: 'South Asia' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', conflictZone: 'South Asia' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', conflictZone: 'South Asia' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', conflictZone: 'South Asia' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', conflictZone: 'South Asia' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', conflictZone: 'South Asia' },
  
  // Africa Conflict Zones
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', conflictZone: 'East Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', conflictZone: 'East Africa' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴', conflictZone: 'East Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', conflictZone: 'West Africa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', conflictZone: 'West Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', conflictZone: 'West Africa' },
  { code: 'zu', name: 'Zulu', nativeName: 'IsiZulu', flag: '🇿🇦', conflictZone: 'Southern Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'IsiXhosa', flag: '🇿🇦', conflictZone: 'Southern Africa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', conflictZone: 'Southern Africa' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', conflictZone: 'East Africa' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', flag: '🇧🇮', conflictZone: 'East Africa' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', flag: '🇺🇬', conflictZone: 'East Africa' },
  
  // Southeast Asia Conflict Zones
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', conflictZone: 'Southeast Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', conflictZone: 'Southeast Asia' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭', conflictZone: 'Southeast Asia' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲', conflictZone: 'Southeast Asia' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', conflictZone: 'Southeast Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', conflictZone: 'Southeast Asia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', conflictZone: 'Southeast Asia' },
];

interface LanguageSelectorProps {
  onLanguageSelect?: (languageCode: string) => void;
  showConflictZones?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageSelect,
  showConflictZones = true
}) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setSelectedLanguage(languageCode);
      onLanguageSelect?.(languageCode);
    } catch (error) {
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const conflictZoneLanguages = showConflictZones 
    ? LANGUAGES.filter(lang => lang.conflictZone)
    : [];

  const otherLanguages = LANGUAGES.filter(lang => !lang.conflictZone);

  const renderLanguageItem = (language: Language) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageItem,
        { 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
        selectedLanguage === language.code && {
          backgroundColor: theme.colors.primary + '20',
          borderColor: theme.colors.primary,
        }
      ]}
      onPress={() => handleLanguageSelect(language.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageDetails}>
          <Text style={[styles.languageName, { color: theme.colors.text }]}>
            {language.name}
          </Text>
          <Text style={[styles.nativeName, { color: theme.colors.textSecondary }]}>
            {language.nativeName}
          </Text>
          {language.conflictZone && (
            <Text style={[styles.conflictZone, { color: theme.colors.primary }]}>
              {language.conflictZone}
            </Text>
          )}
        </View>
      </View>
      {selectedLanguage === language.code && (
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showConflictZones && conflictZoneLanguages.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Conflict Zone Languages
          </Text>
          {conflictZoneLanguages.map(renderLanguageItem)}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Other Languages
        </Text>
        {otherLanguages.map(renderLanguageItem)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    marginBottom: 2,
  },
  conflictZone: {
    fontSize: 12,
    fontWeight: '500',
  },
});
