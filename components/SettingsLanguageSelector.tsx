import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from './LanguageSelector';

interface SettingsLanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
}

export const SettingsLanguageSelector: React.FC<SettingsLanguageSelectorProps> = ({
  onLanguageChange
}) => {
  const { i18n } = useTranslation();
  const theme = useTheme();

  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      'en': 'English',
      'cs': 'Čeština',
      'ru': 'Русский',
      'uk': 'Українська',
      'he': 'עברית',
      'ar': 'العربية',
      'fa': 'فارسی',
      'tr': 'Türkçe',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어',
      'hi': 'हिन्दी',
      'bn': 'বাংলা',
      'ur': 'اردو',
      'sw': 'Kiswahili',
      'am': 'አማርኛ',
      'so': 'Soomaali',
      'yo': 'Yorùbá',
      'ha': 'Hausa',
      'ig': 'Igbo',
    };
    return languages[code] || code;
  };

  const getLanguageFlag = (code: string): string => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'cs': '🇨🇿',
      'ru': '🇷🇺',
      'uk': '🇺🇦',
      'he': '🇮🇱',
      'ar': '🇸🇦',
      'fa': '🇮🇷',
      'tr': '🇹🇷',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'hi': '🇮🇳',
      'bn': '🇧🇩',
      'ur': '🇵🇰',
      'sw': '🇰🇪',
      'am': '🇪🇹',
      'so': '🇸🇴',
      'yo': '🇳🇬',
      'ha': '🇳🇬',
      'ig': '🇳🇬',
    };
    return flags[code] || '🌐';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Language Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Select your preferred language for the app interface
        </Text>
      </View>

      <View style={styles.currentLanguage}>
        <View style={styles.currentLanguageInfo}>
          <Text style={styles.flag}>{getLanguageFlag(i18n.language)}</Text>
          <View style={styles.currentLanguageDetails}>
            <Text style={[styles.currentLanguageName, { color: theme.colors.text }]}>
              {getLanguageName(i18n.language)}
            </Text>
            <Text style={[styles.currentLanguageCode, { color: theme.colors.textSecondary }]}>
              Current Language
            </Text>
          </View>
        </View>
        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
      </View>

      <LanguageSelector 
        onLanguageSelect={onLanguageChange}
        showConflictZones={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  currentLanguageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  currentLanguageDetails: {
    flex: 1,
  },
  currentLanguageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentLanguageCode: {
    fontSize: 14,
  },
});
