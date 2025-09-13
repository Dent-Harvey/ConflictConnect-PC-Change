import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { PressableScale } from '@/components/ui/PressableScale';
import { userService } from '@/services/userService';
import { User, UpdateUserData } from '@/types/user';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { errorHandler } from '@/utils/errorHandler';

// Validation schema
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  icon,
  keyboardType = 'default',
}) => {
  const theme = useTheme();
  
  return (
    <Animated.View 
      entering={FadeIn.delay(100)} 
      style={{
        marginBottom: theme.spacing.md,
      }}
    >
      <Text style={{
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        fontFamily: 'Inter-SemiBold',
      }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        borderWidth: theme.colors.border ? 1 : 0,
        borderColor: error ? theme.colors.error : theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: multiline ? 100 : 50,
      }}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: theme.spacing.sm, marginTop: multiline ? 2 : 0 }}
          />
        )}
        <TextInput
          style={{
            flex: 1,
            fontSize: theme.fontSize.md,
            color: theme.colors.text,
            fontFamily: 'Inter-Regular',
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'sentences'}
        />
      </View>
      {error && (
        <Text style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.error,
          marginTop: theme.spacing.xs,
          fontFamily: 'Inter-Regular',
        }}>
          {error}
        </Text>
      )}
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { firebaseUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      displayName: '',
      firstName: '',
      lastName: '',
      bio: '',
      phoneNumber: '',
      dateOfBirth: '',
      location: {
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
      socialLinks: {
        website: '',
        twitter: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        github: '',
        youtube: '',
        tiktok: '',
      },
    },
  });

  // Load user data
  useEffect(() => {
    loadUserData();
  }, [firebaseUser]);

  const loadUserData = async () => {
    if (!firebaseUser?.uid) return;
    
    try {
      setLoading(true);
      const userData = await userService.getUserById(firebaseUser.uid);
      
      if (userData) {
        setUser(userData);
        setProfileImage(userData.profilePicture || null);
        
        // Populate form with user data
        setValue('username', userData.username || '');
        setValue('displayName', userData.displayName || '');
        setValue('firstName', userData.firstName || '');
        setValue('lastName', userData.lastName || '');
        setValue('bio', userData.bio || '');
        setValue('phoneNumber', userData.phoneNumber || '');
        setValue('dateOfBirth', userData.dateOfBirth || '');
        setValue('location', userData.location || {});
        setValue('socialLinks', userData.socialLinks || {});
      }
    } catch (error) {
      errorHandler({
        filePath: '/app/(tabs)/profile.tsx',
        functionName: 'loadUserData',
        error: error as Error
      });
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      errorHandler({
        filePath: '/app/(tabs)/profile.tsx',
        functionName: 'handleImagePick',
        error: error as Error
      });
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant location permission to auto-fill your location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const addr = address[0];
        setValue('location.address', `${addr.name || ''} ${addr.street || ''}`.trim());
        setValue('location.city', addr.city || '');
        setValue('location.state', addr.region || '');
        setValue('location.country', addr.country || '');
        setValue('location.zipCode', addr.postalCode || '');
      }
    } catch (error) {
      errorHandler({
        filePath: '/app/(tabs)/profile.tsx',
        functionName: 'getCurrentLocation',
        error: error as Error
      });
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!firebaseUser?.uid) return;

    try {
      setSaving(true);
      Keyboard.dismiss();

      const updateData: UpdateUserData = {
        ...data,
        profilePicture: profileImage || undefined,
      };

      await userService.updateUser(firebaseUser.uid, updateData);
      Alert.alert('Success', 'Profile updated successfully');
      loadUserData(); // Reload data
    } catch (error) {
      errorHandler({
        filePath: '/app/(tabs)/profile.tsx',
        functionName: 'onSubmit',
        error: error as Error
      });
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: theme.spacing.lg 
        }}>
          <Text style={{
            fontSize: theme.fontSize.lg,
            color: theme.colors.text,
            fontFamily: 'Inter-Medium',
          }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 64 + 24}
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <Text style={{
            fontSize: theme.fontSize['3xl'],
            fontWeight: 'bold',
            color: theme.colors.onPrimary,
            textAlign: 'center',
            fontFamily: 'Inter-Bold',
          }}>
            {t('screens.profile.title', 'Profile')}
          </Text>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <Animated.View 
            entering={SlideInRight.delay(200)}
            style={{
              alignItems: 'center',
              marginBottom: theme.spacing.xl,
            }}
          >
            <PressableScale onPress={handleImagePick}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing.sm,
                borderWidth: 4,
                borderColor: theme.colors.primary,
              }}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{ width: 112, height: 112, borderRadius: 56 }}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={50}
                    color={theme.colors.textSecondary}
                  />
                )}
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: theme.colors.background,
                }}>
                  <Ionicons
                    name="camera"
                    size={16}
                    color={theme.colors.onPrimary}
                  />
                </View>
              </View>
            </PressableScale>
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              fontFamily: 'Inter-Regular',
            }}>
              {t('screens.profile.tapToChangePhoto', 'Tap to change photo')}
            </Text>
          </Animated.View>

          {/* Basic Information */}
          <Text style={{
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
            fontFamily: 'Inter-Bold',
          }}>
            {t('screens.profile.basicInfo', 'Basic Information')}
          </Text>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.username', 'Username')}
                value={value}
                onChangeText={onChange}
                placeholder={t('screens.profile.usernamePlaceholder', 'Enter your username')}
                error={errors.username?.message}
                icon="at"
              />
            )}
          />

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.displayName', 'Display Name')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('screens.profile.displayNamePlaceholder', 'How others see your name')}
                icon="person"
              />
            )}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.firstName', 'First Name')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.firstNamePlaceholder', 'First name')}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.lastName', 'Last Name')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.lastNamePlaceholder', 'Last name')}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.bio', 'Bio')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('screens.profile.bioPlaceholder', 'Tell others about yourself...')}
                error={errors.bio?.message}
                multiline
                icon="document-text"
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.phoneNumber', 'Phone Number')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('screens.profile.phoneNumberPlaceholder', '+1 (555) 123-4567')}
                keyboardType="phone-pad"
                icon="call"
              />
            )}
          />

          {/* Location Section */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.md,
          }}>
            <Text style={{
              fontSize: theme.fontSize.lg,
              fontWeight: 'bold',
              color: theme.colors.text,
              fontFamily: 'Inter-Bold',
            }}>
              {t('screens.profile.location', 'Location')}
            </Text>
            <PressableScale onPress={getCurrentLocation}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.md,
              }}>
                <Ionicons
                  name="location"
                  size={16}
                  color={theme.colors.onPrimary}
                  style={{ marginRight: theme.spacing.xs }}
                />
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.onPrimary,
                  fontFamily: 'Inter-Medium',
                }}>
                  {t('screens.profile.useCurrentLocation', 'Use Current')}
                </Text>
              </View>
            </PressableScale>
          </View>

          <Controller
            control={control}
            name="location.address"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.address', 'Address')}
                value={value || ''}
                onChangeText={onChange}
                placeholder={t('screens.profile.addressPlaceholder', 'Street address')}
                icon="home"
              />
            )}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="location.city"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.city', 'City')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.cityPlaceholder', 'City')}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="location.state"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.state', 'State/Province')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.statePlaceholder', 'State')}
                  />
                )}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="location.country"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.country', 'Country')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.countryPlaceholder', 'Country')}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="location.zipCode"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.zipCode', 'ZIP Code')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder={t('screens.profile.zipCodePlaceholder', 'ZIP')}
                  />
                )}
              />
            </View>
          </View>

          {/* Social Media Links */}
          <Text style={{
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            fontFamily: 'Inter-Bold',
          }}>
            {t('screens.profile.socialLinks', 'Social Media Links')}
          </Text>

          <Controller
            control={control}
            name="socialLinks.website"
            render={({ field: { onChange, value } }) => (
              <InputField
                label={t('screens.profile.website', 'Website')}
                value={value || ''}
                onChangeText={onChange}
                placeholder="https://your-website.com"
                keyboardType="url"
                icon="globe"
                error={errors.socialLinks?.website?.message}
              />
            )}
          />

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.twitter"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.twitter', 'Twitter')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="@username"
                    icon="logo-twitter"
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.instagram"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.instagram', 'Instagram')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="@username"
                    icon="logo-instagram"
                  />
                )}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.linkedin"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.linkedin', 'LinkedIn')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="username"
                    icon="logo-linkedin"
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.github"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.github', 'GitHub')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="username"
                    icon="logo-github"
                  />
                )}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.youtube"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.youtube', 'YouTube')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="channel"
                    icon="logo-youtube"
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="socialLinks.tiktok"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label={t('screens.profile.tiktok', 'TikTok')}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="@username"
                    icon="musical-notes"
                  />
                )}
              />
            </View>
          </View>

          {/* Save Button */}
          <PressableScale
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? [theme.colors.textSecondary, theme.colors.textSecondary] : [theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: theme.spacing.md,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                marginTop: theme.spacing.lg,
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{
                fontSize: theme.fontSize.lg,
                fontWeight: 'bold',
                color: theme.colors.onPrimary,
                fontFamily: 'Inter-Bold',
              }}>
                {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Profile')}
              </Text>
            </LinearGradient>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}