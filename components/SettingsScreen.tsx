import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useTheme } from '@/hooks/useTheme';
import { errorHandler } from '@/utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsLanguageSelector } from './SettingsLanguageSelector';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useFirebaseAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              errorHandler({
                filePath: 'components/SettingsScreen.tsx',
                functionName: 'handleLogout',
                error: error as Error
              });
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      id: 'language',
      title: 'Language',
      subtitle: 'Change app language',
      icon: 'language',
      onPress: () => setShowLanguageModal(true),
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Edit your profile information',
      icon: 'person',
      onPress: () => {
        // Navigate to profile editing
        Alert.alert('Coming Soon', 'Profile editing will be available in the next update.');
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications',
      onPress: () => {
        Alert.alert('Coming Soon', 'Notification settings will be available in the next update.');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      icon: 'shield-checkmark',
      onPress: () => {
        Alert.alert('Coming Soon', 'Privacy settings will be available in the next update.');
      },
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle',
      onPress: () => {
        Alert.alert(
          'About Conflict\Connect',
          'Version 1.0.0\n\nConflict\Connect helps connect resources and people during emergency situations.',
          [{ text: 'OK' }]
        );
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Manage your account and app preferences
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={styles.avatarText}>
              {user?.profile?.firstName?.charAt(0) || user?.role?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.profile?.firstName && user?.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user?.role?.replace('_', ' ').toUpperCase() || 'User'
              }
            </Text>
            <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
              {user?.role?.replace('_', ' ').toUpperCase() || 'Unknown Role'}
            </Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
                index === settingsItems.length - 1 && styles.lastItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <SettingsLanguageSelector />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '500',
  },
});
