import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, LinearTransition, withTiming } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useUserNeeds, useDeleteNeed, useCreateNeed } from '@/hooks/useUserNeeds';
import { UserNeed } from '@/services/userNeedsService';
import { AddNeedModal } from '@/components/AddNeedModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { SuggestedNeedsCard } from '@/components/SuggestedNeedsCard';
import { useSuggestedNeeds, SuggestedNeed } from '@/hooks/useSuggestedNeeds';
import { useConflictZones } from '@/hooks/useConflictData';

interface NeedCardProps {
  need: UserNeed;
  onEdit: (need: UserNeed) => void;
  onDelete: (needId: string) => void;
  onViewMatches: (need: UserNeed) => void;
}

const NeedCard: React.FC<NeedCardProps> = ({ need, onEdit, onDelete, onViewMatches }) => {
  const theme = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
      case 'critical':
        return theme.colors.error;
      case 'high':
        return '#FF6B35';
      case 'medium':
        return '#FFB800';
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return theme.colors.success;
      case 'in_progress':
      case 'partially_fulfilled':
        return '#FFB800';
      case 'open':
        return theme.colors.primary;
      case 'cancelled':
      case 'expired':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
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
    priorityTag: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusTag: {
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
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
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
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: theme.borderRadius.hairline,
      borderColor: theme.colors.border,
    },
    editButton: {
      borderColor: theme.colors.primary,
    },
    deleteButton: {
      borderColor: theme.colors.error,
    },
    matchesButton: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      fontFamily: 'Inter-Medium',
    },
    editButtonText: {
      color: theme.colors.primary,
    },
    deleteButtonText: {
      color: theme.colors.error,
    },
    matchesButtonText: {
      color: 'white',
    },
    dateText: {
      fontSize: theme.fontSize.xs,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(150)} 
      layout={LinearTransition.duration(200)}
    >
      <PressableScale style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{need.title}</Text>
          <View style={styles.tags}>
            <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(need.priority) }]}>
              <Text style={styles.tagText}>{need.priority.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: getStatusColor(need.status) }]}>
              <Text style={styles.tagText}>{need.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {need.description}
        </Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{need.category}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>
              {need.quantity} {need.unit || 'units'}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Urgency:</Text>
            <Text style={styles.detailValue}>
              {need.urgency.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.actionButtons}>
            <PressableScale
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(need)}
            >
              <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
            </PressableScale>
            <PressableScale
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(need.id!)}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </PressableScale>
            <PressableScale
              style={[styles.actionButton, styles.matchesButton]}
              onPress={() => onViewMatches(need)}
            >
              <Text style={[styles.actionButtonText, styles.matchesButtonText]}>Find Resources</Text>
            </PressableScale>
          </View>
          <Text style={styles.dateText}>{formatDate(need.createdAt)}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

export default function NeedsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConflictZone] = useState('default_zone'); // This should come from context or props

  const {
    data: needs = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useUserNeeds();

  const { data: conflictZones = [] } = useConflictZones();
  const deleteNeedMutation = useDeleteNeed();
  const createNeedMutation = useCreateNeed();
  
  // For demo purposes, use the first conflict zone or create a default one
  const currentConflictZone = conflictZones[0] || {
    id: 'default',
    title: 'Current Area',
    description: 'Current conflict area',
    latitude: 0,
    longitude: 0,
    severity: 'medium' as const,
    status: 'active' as const,
    dateReported: new Date().toISOString(),
    location: 'Current Location',
    country: 'Unknown',
    region: 'Unknown',
    tags: ['general'],
    verified: false,
    lastUpdated: new Date().toISOString(),
  };

  const { suggestions } = useSuggestedNeeds({
    conflictZone: currentConflictZone,
    existingNeeds: needs,
    enabled: needs.length === 0, // Only show when no needs exist
  });

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  const handleAddNeed = async () => {
    // Check if user has completed profile for requesting needs
    if (user && !user.hasCompletedProfile) {
      Alert.alert(
        'Profile Required',
        'You need to complete your profile before requesting resources. This helps providers understand your situation and contact you.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Profile', onPress: () => {
            // Navigate to profile setup - this will be handled by the auth system
            // The user will be redirected to profile setup automatically
          }}
        ]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAddModal(true);
  };

  const handleEditNeed = async (need: UserNeed) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to edit screen or open edit modal
    console.log('Edit need:', need);
  };

  const handleDeleteNeed = async (needId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Need',
      'Are you sure you want to delete this need? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNeedMutation.mutateAsync(needId);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to delete need:', error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete need. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewMatches = async (need: UserNeed) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to resource matching screen
    router.push({
      pathname: '/app/resource-matches',
      params: { needId: need.id, category: need.category, 
               lat: need.location.latitude, lng: need.location.longitude }
    });
  };

  const handleAddSuggestion = async (suggestion: SuggestedNeed) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use current location or conflict zone location
      const location = {
        latitude: currentConflictZone.latitude || 0,
        longitude: currentConflictZone.longitude || 0,
      };
      
      const needTemplate = {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        urgency: suggestion.urgency,
        quantity: suggestion.quantity,
        unit: suggestion.unit,
        location,
        conflictZoneId: currentConflictZone.id || 'default',
        tags: suggestion.tags,
        status: 'open' as const,
        userId: 'current-user', // This should come from auth context
        contactInfo: {
          name: 'Current User',
          preferredContact: 'app',
        },
      };
      
      await createNeedMutation.mutateAsync(needTemplate);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to add suggested need:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add need. Please try again.');
    }
  };

  const renderNeed = ({ item }: { item: UserNeed }) => (
    <NeedCard
      need={item}
      onEdit={handleEditNeed}
      onDelete={handleDeleteNeed}
      onViewMatches={handleViewMatches}
    />
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
      {suggestions.length > 0 ? (
        <SuggestedNeedsCard
          suggestions={suggestions}
          onAddSuggestion={handleAddSuggestion}
          conflictZoneName={currentConflictZone.title}
        />
      ) : (
        <>
          <Text style={styles.emptyText}>{t('needs.emptyTitle')}</Text>
          <Text style={styles.emptySubtext}>
            {t('needs.emptySubtitle')}
          </Text>
        </>
      )}
    </Animated.View>
  );

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
      backgroundColor: theme.colors.surface,
      borderBottomWidth: theme.borderRadius.hairline,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginLeft: -theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 40,
      height: 36,
    },
    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
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
      justifyContent: 'flex-start',
      paddingHorizontal: suggestions.length > 0 ? 0 : theme.spacing.xl,
      paddingTop: suggestions.length > 0 ? theme.spacing.lg : theme.spacing.xl * 2,
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
    errorState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    errorText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    errorSubtext: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: t('needs.myNeeds'),
            headerShown: false,
          }} 
        />
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <PressableScale 
              style={styles.backButton} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons 
                name="chevron-back" 
                size={26} 
                color={theme.colors.primary} 
              />
            </PressableScale>
            <Text style={[styles.headerTitle, { marginLeft: theme.spacing.sm }]}>{t('needs.myNeeds')}</Text>
          </View>
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Failed to load needs</Text>
          <Text style={styles.errorSubtext}>
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
          title: t('needs.myNeeds'),
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <PressableScale 
            style={styles.backButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons 
              name="chevron-back" 
              size={26} 
              color={theme.colors.primary} 
            />
          </PressableScale>
          <Text style={[styles.headerTitle, { marginLeft: theme.spacing.sm }]}>{t('needs.myNeeds')}</Text>
        </View>
        <PressableScale style={styles.addButton} onPress={handleAddNeed}>
          <Text style={styles.addButtonText}>+ Add Need</Text>
        </PressableScale>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        data={needs}
        keyExtractor={(item) => item.id!}
        renderItem={renderNeed}
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
        visible={showAddModal}
        presentationStyle="pageSheet"
        animationType="slide"
      >
        <AddNeedModal
          conflictZoneId={selectedConflictZone}
          location={{ latitude: 0, longitude: 0 }} // This should come from user's location or selected zone
          onClose={() => setShowAddModal(false)}
        />
      </Modal>
    </View>
  );
}