import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useMatchResources, useRequestFulfillment } from '@/hooks/useUserNeeds';
import { Resource } from '@/services/userNeedsService';

const fulfillmentSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
});

type FulfillmentFormData = z.infer<typeof fulfillmentSchema>;

interface ResourceCardProps {
  resource: Resource;
  onRequestFulfillment: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onRequestFulfillment }) => {
  const theme = useTheme();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'donation':
        return theme.colors.success;
      case 'service':
        return theme.colors.primary;
      case 'facility':
        return '#FF9800';
      case 'equipment':
        return '#9C27B0';
      case 'volunteer':
        return '#4CAF50';
      case 'expertise':
        return '#607D8B';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'limited':
        return '#FFB800';
      case 'reserved':
        return '#FF6B35';
      case 'unavailable':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatDistance = (serviceRadius?: number) => {
    if (!serviceRadius) return 'Location-based';
    return serviceRadius > 1 ? `${serviceRadius}km radius` : `${serviceRadius * 1000}m radius`;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: theme.borderRadius.hairline,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    tags: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    typeTag: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    availabilityTag: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tagText: {
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    description: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    details: {
      marginBottom: theme.spacing.md,
    },
    detail: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    detailLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      fontFamily: 'Inter-Medium',
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Regular',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'right',
    },
    providerInfo: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    providerName: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    providerOrg: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    verifiedText: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Medium',
      color: theme.colors.success,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    requestButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flex: 1,
    },
    requestButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    requestButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
      textAlign: 'center',
    },
    distance: {
      fontSize: theme.fontSize.xs,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
    },
  });

  const isAvailable = resource.availability?.status === 'available' || resource.availability?.status === 'limited';

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
      <PressableScale style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{resource.title}</Text>
          <View style={styles.tags}>
            <View style={[styles.typeTag, { backgroundColor: getTypeColor(resource.type) }]}>
              <Text style={styles.tagText}>{resource.type.toUpperCase()}</Text>
            </View>
            <View style={[styles.availabilityTag, { backgroundColor: getAvailabilityColor(resource.availability?.status || 'unknown') }]}>
              <Text style={styles.tagText}>{resource.availability?.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {resource.description}
        </Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Quantity Available:</Text>
            <Text style={styles.detailValue}>
              {resource.quantity} {resource.unit || 'units'}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{resource.category}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Service Area:</Text>
            <Text style={styles.detailValue}>
              {formatDistance(resource.location.serviceRadius)}
            </Text>
          </View>
        </View>

        {resource.providerInfo && (
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>
              {resource.providerInfo.name || 'Provider'}
            </Text>
            {resource.providerInfo.organization && (
              <Text style={styles.providerOrg}>
                {resource.providerInfo.organization}
              </Text>
            )}
            {resource.providerInfo.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified Provider</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <PressableScale
            style={[
              styles.requestButton,
              !isAvailable && styles.requestButtonDisabled,
            ]}
            onPress={() => onRequestFulfillment(resource)}
            disabled={!isAvailable}
          >
            <Text style={styles.requestButtonText}>
              {isAvailable ? 'Request Resource' : 'Not Available'}
            </Text>
          </PressableScale>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

export default function ResourceMatchesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    needId: string;
    category: string;
    lat: string;
    lng: string;
  }>();

  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const location = {
    latitude: parseFloat(params.lat),
    longitude: parseFloat(params.lng),
  };

  const {
    data: matchedResources = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useMatchResources(params.needId, params.category, location);

  const requestFulfillmentMutation = useRequestFulfillment();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FulfillmentFormData>({
    resolver: zodResolver(fulfillmentSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  const handleRequestFulfillment = async (resource: Resource) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedResource(resource);
    setShowFulfillmentModal(true);
  };

  const onSubmitFulfillment = async (data: FulfillmentFormData) => {
    if (!selectedResource) return;

    try {
      await requestFulfillmentMutation.mutateAsync({
        needId: params.needId,
        resourceId: selectedResource.id!,
        quantity: data.quantity,
        notes: data.notes,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      reset();
      setShowFulfillmentModal(false);
      setSelectedResource(null);

      Alert.alert(
        'Request Sent',
        'Your fulfillment request has been sent to the resource provider. They will be in touch soon.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Failed to request fulfillment:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Failed to send fulfillment request. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCloseFulfillmentModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    setShowFulfillmentModal(false);
    setSelectedResource(null);
    reset();
  };

  const renderResource = ({ item }: { item: Resource }) => (
    <ResourceCard
      resource={item}
      onRequestFulfillment={handleRequestFulfillment}
    />
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyState}>
      <Text style={styles.emptyText}>No matching resources found</Text>
      <Text style={styles.emptySubtext}>
        There are currently no available resources that match your need in this area. Try expanding your search or check back later.
      </Text>
    </Animated.View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: insets.top + theme.spacing.md,
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.borderRadius.hairline,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    list: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: theme.spacing.lg,
      paddingBottom: insets.bottom + theme.spacing.xl,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl * 2,
    },
    emptyText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    emptySubtext: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: insets.top + theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: theme.borderRadius.hairline,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
    },
    modalButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    modalButtonText: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Medium',
      color: theme.colors.primary,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    formSection: {
      marginBottom: theme.spacing.xl,
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
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
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
    submitButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
  });

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Resource Matches',
            headerShown: false,
          }} 
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Resource Matches</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Failed to load resources</Text>
          <Text style={styles.emptySubtext}>
            Please check your connection and try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Resource Matches',
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Resources</Text>
        <Text style={styles.headerSubtitle}>
          {params.category} • {matchedResources.length} matches
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={matchedResources}
        keyExtractor={(item) => item.id!}
        renderItem={renderResource}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />

      <Modal
        visible={showFulfillmentModal}
        presentationStyle="pageSheet"
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <PressableScale style={styles.modalButton} onPress={handleCloseFulfillmentModal}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </PressableScale>
            
            <Text style={styles.modalTitle}>Request Resource</Text>
            
            <View style={{ width: 60 }} />
          </View>

          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 60 + 24}
          >
            <View style={styles.modalContent}>
              <View style={styles.formSection}>
                <Text style={styles.label}>Quantity Needed *</Text>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(parseInt(text) || 1)}
                      placeholder="1"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.quantity && <Text style={styles.errorText}>{errors.quantity.message}</Text>}
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Additional Notes (Optional)</Text>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={value || ''}
                      onChangeText={onChange}
                      placeholder="Any additional information, special requirements, or contact preferences..."
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      autoCapitalize="sentences"
                    />
                  )}
                />
              </View>

              <PressableScale
                style={styles.submitButton}
                onPress={handleSubmit(onSubmitFulfillment)}
              >
                <Text style={styles.submitButtonText}>
                  Send Request
                </Text>
              </PressableScale>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}