import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useCreateResource } from '@/hooks/useResources';
import { CreateResourceRequest } from '@/services/resourcesService';

const resourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  category: z.enum(['food', 'water', 'medical', 'shelter', 'transportation', 'communication', 'security', 'supplies', 'evacuation', 'personnel', 'other']),
  type: z.enum(['donation', 'service', 'facility', 'equipment', 'volunteer', 'expertise']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  providerOrganization: z.string().optional(),
  providerPhone: z.string().min(10, 'Valid phone number required'),
  providerEmail: z.string().email('Valid email required'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  availability: z.enum(['available', 'limited', 'reserved', 'unavailable']),
  schedule: z.string().optional(),
  conditions: z.string().optional(),
  requirements: z.string().optional(),
  tags: z.string().optional(),
  serviceRadius: z.number().optional(),
  expiresAt: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface AddResourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'food', label: '🍞 Food', description: 'Food supplies and meals' },
  { value: 'water', label: '💧 Water', description: 'Drinking water and purification' },
  { value: 'medical', label: '🏥 Medical', description: 'First aid and medical supplies' },
  { value: 'shelter', label: '🏠 Shelter', description: 'Housing and temporary shelter' },
  { value: 'transportation', label: '🚗 Transport', description: 'Vehicles and transportation' },
  { value: 'supplies', label: '📦 Supplies', description: 'General supplies and equipment' },
  { value: 'other', label: '📋 Other', description: 'Other resources' },
];

const TYPE_OPTIONS = [
  { value: 'donation', label: 'Donation', description: 'Items to give away' },
  { value: 'service', label: 'Service', description: 'Services offered' },
  { value: 'facility', label: 'Facility', description: 'Location or facility access' },
  { value: 'equipment', label: 'Equipment', description: 'Tools and equipment' },
  { value: 'volunteer', label: 'Volunteer', description: 'Volunteer services' },
  { value: 'expertise', label: 'Expertise', description: 'Professional expertise' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'emergency', label: 'Emergency', color: '#dc2626' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', color: '#22c55e' },
  { value: 'limited', label: 'Limited', color: '#f59e0b' },
  { value: 'reserved', label: 'Reserved', color: '#6366f1' },
  { value: 'unavailable', label: 'Unavailable', color: '#6b7280' },
];

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const createResource = useCreateResource();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      category: 'supplies',
      type: 'donation',
      priority: 'medium',
      availability: 'available',
      quantity: 1,
      unit: 'items',
      serviceRadius: 5,
    },
  });

  const watchedCategory = watch('category');
  const watchedType = watch('type');

  const getCurrentLocation = useCallback(async () => {
    console.log('[ADD RESOURCE] Getting current location...');
    setIsGettingLocation(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Access',
          'Location permission is required to add your resource location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation(location);
      
      // Reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addresses.length > 0) {
          const address = addresses[0];
          console.log('[ADD RESOURCE] Got address:', address);
        }
      } catch (geocodeError) {
        console.log('[ADD RESOURCE] Geocoding failed, but location obtained');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[ADD RESOURCE] Location error:', error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const onSubmit = useCallback(async (data: ResourceFormData) => {
    console.log('[ADD RESOURCE] Submitting resource:', data.title);

    if (!currentLocation) {
      Alert.alert(
        'Location Required',
        'Please set your location to add the resource.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();

    try {
      const resourceRequest: CreateResourceRequest = {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          serviceRadius: data.serviceRadius,
        },
        providerInfo: {
          name: data.providerName,
          organization: data.providerOrganization,
          phone: data.providerPhone,
          email: data.providerEmail,
        },
        availability: {
          status: data.availability,
          schedule: data.schedule,
          conditions: data.conditions,
        },
        requirements: data.requirements ? data.requirements.split(',').map(r => r.trim()).filter(r => r) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        priority: data.priority,
        expiresAt: data.expiresAt,
      };

      await createResource.mutateAsync(resourceRequest);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'RESOURCE UPLOADED',
        'Your resource has been successfully added and is now available to help those in need.',
        [
          {
            text: 'ACKNOWLEDGED',
            onPress: () => {
              reset();
              setCurrentLocation(null);
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[ADD RESOURCE] Submit error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'UPLOAD FAILED',
        'Could not upload your resource. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [currentLocation, createResource, reset, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    reset();
    setCurrentLocation(null);
    onClose();
  }, [reset, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 24}
      >
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              📦 UPLOAD RESOURCE
            </Text>
            <PressableScale onPress={handleClose}>
              <View style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>
                  ✕
                </Text>
              </View>
            </PressableScale>
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Resource Info Section */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Resource Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Resource Title *
                </Text>
                <Controller
                  name="title"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: errors.title ? theme.colors.error : theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="e.g., Bottled Water Supply"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.title && (
                  <Text style={[styles.error, { color: theme.colors.error }]}>
                    {errors.title.message}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Description *
                </Text>
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.textArea,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: errors.description ? theme.colors.error : theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="Detailed description of the resource, condition, and any special instructions..."
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                    />
                  )}
                />
                {errors.description && (
                  <Text style={[styles.error, { color: theme.colors.error }]}>
                    {errors.description.message}
                  </Text>
                )}
              </View>

              {/* Category Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Category *
                </Text>
                <Controller
                  name="category"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.optionGrid}>
                      {CATEGORY_OPTIONS.map((option) => (
                        <PressableScale key={option.value} onPress={() => onChange(option.value)}>
                          <View
                            style={[
                              styles.optionCard,
                              {
                                backgroundColor: value === option.value ? theme.colors.primary : theme.colors.background,
                                borderColor: value === option.value ? theme.colors.primary : theme.colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: value === option.value ? theme.colors.onPrimary : theme.colors.text,
                                },
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              style={[
                                styles.optionDescription,
                                {
                                  color: value === option.value ? theme.colors.onPrimary : theme.colors.textSecondary,
                                },
                              ]}
                            >
                              {option.description}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />
              </View>

              {/* Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Type *
                </Text>
                <Controller
                  name="type"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.optionGrid}>
                      {TYPE_OPTIONS.map((option) => (
                        <PressableScale key={option.value} onPress={() => onChange(option.value)}>
                          <View
                            style={[
                              styles.optionCard,
                              {
                                backgroundColor: value === option.value ? theme.colors.secondary : theme.colors.background,
                                borderColor: value === option.value ? theme.colors.secondary : theme.colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: value === option.value ? theme.colors.onSecondary : theme.colors.text,
                                },
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              style={[
                                styles.optionDescription,
                                {
                                  color: value === option.value ? theme.colors.onSecondary : theme.colors.textSecondary,
                                },
                              ]}
                            >
                              {option.description}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />
              </View>

              {/* Quantity and Unit */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Quantity *
                  </Text>
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: errors.quantity ? theme.colors.error : theme.colors.border,
                            color: theme.colors.text,
                          },
                        ]}
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value?.toString()}
                        onChangeText={(text) => onChange(parseInt(text) || 0)}
                        onBlur={onBlur}
                        keyboardType="numeric"
                      />
                    )}
                  />
                  {errors.quantity && (
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                      {errors.quantity.message}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 3, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Unit *
                  </Text>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: errors.unit ? theme.colors.error : theme.colors.border,
                            color: theme.colors.text,
                          },
                        ]}
                        placeholder="e.g., bottles, boxes, hours"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  {errors.unit && (
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                      {errors.unit.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Provider Information */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Provider Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Your Name *
                </Text>
                <Controller
                  name="providerName"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: errors.providerName ? theme.colors.error : theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="Your full name"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.providerName && (
                  <Text style={[styles.error, { color: theme.colors.error }]}>
                    {errors.providerName.message}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Organization (Optional)
                </Text>
                <Controller
                  name="providerOrganization"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="NGO, Company, or Group name"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Phone *
                  </Text>
                  <Controller
                    name="providerPhone"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: errors.providerPhone ? theme.colors.error : theme.colors.border,
                            color: theme.colors.text,
                          },
                        ]}
                        placeholder="+1234567890"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="phone-pad"
                      />
                    )}
                  />
                  {errors.providerPhone && (
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                      {errors.providerPhone.message}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Email *
                  </Text>
                  <Controller
                    name="providerEmail"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: errors.providerEmail ? theme.colors.error : theme.colors.border,
                            color: theme.colors.text,
                          },
                        ]}
                        placeholder="your@email.com"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    )}
                  />
                  {errors.providerEmail && (
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                      {errors.providerEmail.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Location */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Location
              </Text>

              <View style={styles.inputGroup}>
                <PressableScale onPress={getCurrentLocation} disabled={isGettingLocation}>
                  <View
                    style={[
                      styles.locationButton,
                      {
                        backgroundColor: currentLocation ? theme.colors.success : theme.colors.secondary,
                        borderColor: currentLocation ? theme.colors.success : theme.colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.locationButtonText,
                        {
                          color: currentLocation ? '#FFFFFF' : theme.colors.onSecondary,
                        },
                      ]}
                    >
                      {isGettingLocation
                        ? '📍 Getting Location...'
                        : currentLocation
                        ? '✅ Location Set'
                        : '📍 Set Current Location'}
                    </Text>
                  </View>
                </PressableScale>

                {currentLocation && (
                  <Animated.View entering={FadeIn} style={styles.locationInfo}>
                    <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                      Lat: {currentLocation.coords.latitude.toFixed(6)}, Lng: {currentLocation.coords.longitude.toFixed(6)}
                    </Text>
                  </Animated.View>
                )}
              </View>

              {watchedType === 'service' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    Service Radius (km)
                  </Text>
                  <Controller
                    name="serviceRadius"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                            color: theme.colors.text,
                          },
                        ]}
                        placeholder="5"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={value?.toString()}
                        onChangeText={(text) => onChange(parseInt(text) || 5)}
                        onBlur={onBlur}
                        keyboardType="numeric"
                      />
                    )}
                  />
                </View>
              )}
            </View>

            {/* Availability & Priority */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Availability & Priority
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Availability Status *
                </Text>
                <Controller
                  name="availability"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.optionRow}>
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <PressableScale key={option.value} onPress={() => onChange(option.value)}>
                          <View
                            style={[
                              styles.statusOption,
                              {
                                backgroundColor: value === option.value ? option.color : theme.colors.background,
                                borderColor: value === option.value ? option.color : theme.colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusLabel,
                                {
                                  color: value === option.value ? '#FFFFFF' : theme.colors.text,
                                },
                              ]}
                            >
                              {option.label}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Priority Level *
                </Text>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.optionRow}>
                      {PRIORITY_OPTIONS.map((option) => (
                        <PressableScale key={option.value} onPress={() => onChange(option.value)}>
                          <View
                            style={[
                              styles.statusOption,
                              {
                                backgroundColor: value === option.value ? option.color : theme.colors.background,
                                borderColor: value === option.value ? option.color : theme.colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusLabel,
                                {
                                  color: value === option.value ? '#FFFFFF' : theme.colors.text,
                                },
                              ]}
                            >
                              {option.label}
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Additional Information */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                Additional Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Schedule (Optional)
                </Text>
                <Controller
                  name="schedule"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="e.g., Mon-Fri 9AM-5PM, Weekends available"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Requirements (Optional)
                </Text>
                <Controller
                  name="requirements"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="e.g., ID required, must pickup, photo verification"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Tags (Optional)
                </Text>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="e.g., emergency, families, urgent, bulk"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <PressableScale
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || !currentLocation || createResource.isPending}
            >
              <View
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: isValid && currentLocation && !createResource.isPending
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color: isValid && currentLocation && !createResource.isPending
                        ? theme.colors.onPrimary
                        : theme.colors.surface,
                    },
                  ]}
                >
                  {createResource.isPending
                    ? '📡 UPLOADING...'
                    : '📦 UPLOAD RESOURCE'}
                </Text>
              </View>
            </PressableScale>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionGrid: {
    gap: 8,
  },
  optionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  locationButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  locationInfo: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
});