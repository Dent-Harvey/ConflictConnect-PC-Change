import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useCreateNeed } from '@/hooks/useUserNeeds';
import { UserNeed } from '@/services/userNeedsService';

const needSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['food', 'water', 'medical', 'shelter', 'transportation', 'communication', 'security', 'supplies', 'evacuation', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  urgency: z.enum(['immediate', 'within_hours', 'within_days', 'within_weeks', 'not_urgent']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  landmark: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  preferredContact: z.string().optional(),
  tags: z.string().optional(),
});

type NeedFormData = z.infer<typeof needSchema>;

interface AddNeedModalProps {
  conflictZoneId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  onClose: () => void;
}

const categoryOptions = [
  { label: 'Food', value: 'food' },
  { label: 'Water', value: 'water' },
  { label: 'Medical', value: 'medical' },
  { label: 'Shelter', value: 'shelter' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Communication', value: 'communication' },
  { label: 'Security', value: 'security' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Evacuation', value: 'evacuation' },
  { label: 'Other', value: 'other' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
  { label: 'Emergency', value: 'emergency' },
];

const urgencyOptions = [
  { label: 'Immediate', value: 'immediate' },
  { label: 'Within Hours', value: 'within_hours' },
  { label: 'Within Days', value: 'within_days' },
  { label: 'Within Weeks', value: 'within_weeks' },
  { label: 'Not Urgent', value: 'not_urgent' },
];

export const AddNeedModal: React.FC<AddNeedModalProps> = ({
  conflictZoneId,
  location,
  onClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const createNeedMutation = useCreateNeed();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NeedFormData>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      category: 'food',
      priority: 'medium',
      urgency: 'within_days',
      quantity: 1,
    },
  });

  const onSubmit = async (data: NeedFormData) => {
    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const needData: Omit<UserNeed, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        urgency: data.urgency,
        quantity: data.quantity,
        unit: data.unit,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: data.address,
          landmark: data.landmark,
        },
        conflictZoneId,
        userId: 'current_user', // This should come from auth context
        status: 'open',
        contactInfo: {
          name: data.contactName,
          phone: data.contactPhone,
          email: data.contactEmail,
          preferredContact: data.preferredContact,
        },
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };

      await createNeedMutation.mutateAsync(needData);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      reset();
      onClose();
      
      Alert.alert(
        'Need Added',
        'Your need has been successfully added and is now visible to resource providers.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Failed to create need:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Failed to add need. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onClose();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: insets.top + theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: theme.borderRadius.hairline,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
    },
    headerButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    headerButtonText: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Medium',
      color: theme.colors.primary,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: insets.bottom + theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      fontFamily: 'Inter-Medium',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderRadius.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.text,
      minHeight: 44,
    },
    textInputFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    pickerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    pickerOption: {
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderRadius.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    pickerOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pickerOptionText: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Medium',
      color: theme.colors.text,
    },
    pickerOptionTextSelected: {
      color: 'white',
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    quantityInput: {
      flex: 1,
    },
    unitInput: {
      flex: 1,
    },
    errorText: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Regular',
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      minHeight: 48,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    submitButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    loadingText: {
      color: 'white',
    },
  });

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(150)} 
      style={styles.container}
    >
      <View style={styles.header}>
        <PressableScale style={styles.headerButton} onPress={handleCancel}>
          <Text style={[styles.headerButtonText, styles.cancelButtonText]}>Cancel</Text>
        </PressableScale>
        
        <Text style={styles.headerTitle}>Add Need</Text>
        
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 60 + 24}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.textInput]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Brief description of what you need"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="sentences"
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Detailed description of your need, current situation, and any specific requirements"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    autoCapitalize="sentences"
                  />
                )}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerRow}>
                    {categoryOptions.map((option) => (
                      <PressableScale
                        key={option.value}
                        style={[
                          styles.pickerOption,
                          value === option.value && styles.pickerOptionSelected,
                        ]}
                        onPress={() => onChange(option.value)}
                        duration={100}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            value === option.value && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>
                )}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority & Urgency</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority *</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerRow}>
                    {priorityOptions.map((option) => (
                      <PressableScale
                        key={option.value}
                        style={[
                          styles.pickerOption,
                          value === option.value && styles.pickerOptionSelected,
                        ]}
                        onPress={() => onChange(option.value)}
                        duration={100}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            value === option.value && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Urgency *</Text>
              <Controller
                control={control}
                name="urgency"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerRow}>
                    {urgencyOptions.map((option) => (
                      <PressableScale
                        key={option.value}
                        style={[
                          styles.pickerOption,
                          value === option.value && styles.pickerOptionSelected,
                        ]}
                        onPress={() => onChange(option.value)}
                        duration={100}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            value === option.value && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </PressableScale>
                    ))}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity & Unit</Text>
              <View style={styles.quantityRow}>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.textInput, styles.quantityInput]}
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(parseInt(text) || 1)}
                      placeholder="1"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="unit"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.textInput, styles.unitInput]}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="people, kg, liters, etc."
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  )}
                />
              </View>
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity.message}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Specific address or area description"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Landmark (Optional)</Text>
              <Controller
                control={control}
                name="landmark"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Nearby landmark or reference point"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Name</Text>
              <Controller
                control={control}
                name="contactName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Your name or contact person"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="contactPhone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Phone number for coordination"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="contactEmail"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Email address"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail.message}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value || ''}
                    onChangeText={onChange}
                    placeholder="Comma-separated tags for better matching"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}
              />
            </View>
          </View>

          <PressableScale
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            duration={150}
          >
            <Text style={[styles.submitButtonText, isSubmitting && styles.loadingText]}>
              {isSubmitting ? 'Adding Need...' : 'Add Need'}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};