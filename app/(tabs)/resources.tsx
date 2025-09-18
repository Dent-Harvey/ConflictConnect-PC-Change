import { AddResourceModal } from '@/components/AddResourceModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PressableScale } from '@/components/ui/PressableScale';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import {
    useAvailableResources,
    useDeleteResource,
    useMarkResourceDepleted,
    useResources,
    useToggleResourceAvailability
} from '@/hooks/useResources';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Resource, ResourceData } from '@/services/resourcesService';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    SlideInRight,
    SlideOutLeft
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORY_ICONS: Record<ResourceData['category'], string> = {
  food: '🍞',
  water: '💧',
  medical: '🏥',
  shelter: '🏠',
  transportation: '🚗',
  communication: '📡',
  security: '🛡️',
  supplies: '📦',
  evacuation: '🚁',
  personnel: '👥',
  other: '📋',
};

const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  emergency: '#dc2626',
};

const AVAILABILITY_COLORS = {
  available: '#22c55e',
  limited: '#f59e0b',
  reserved: '#6366f1',
  unavailable: '#6b7280',
};

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onToggleAvailability?: (resource: Resource) => void;
  onMarkDepleted?: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete,
  onToggleAvailability,
  onMarkDepleted,
}) => {
  const theme = useTheme();
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(!showActions);
  }, [showActions]);

  const priorityColor = PRIORITY_COLORS[resource.data.priority];
  const availabilityColor = AVAILABILITY_COLORS[resource.data.availability.status];
  const categoryIcon = CATEGORY_ICONS[resource.data.category];

  return (
    <Animated.View
      layout={LinearTransition}
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
    >
      <PressableScale onLongPress={handleLongPress}>
        <View
          style={[
            styles.resourceCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderLeftColor: priorityColor,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.resourceHeader}>
            <View style={styles.resourceTitleRow}>
              <Text style={[styles.resourceIcon, { fontSize: 20 }]}>
                {categoryIcon}
              </Text>
              <Text 
                style={[
                  styles.resourceTitle, 
                  { 
                    color: theme.colors.text,
                    flex: 1,
                  }
                ]}
                numberOfLines={1}
              >
                {resource.data.title}
              </Text>
              <View style={styles.badges}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: availabilityColor },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                    {resource.data.availability.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text 
              style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {resource.data.description}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.resourceDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Quantity:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.data.quantity} {resource.data.unit}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Type:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.data.type}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Priority:
              </Text>
              <Text style={[styles.detailValue, { color: priorityColor }]}>
                {resource.data.priority.toUpperCase()}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Provider:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.data.providerInfo.name}
                {resource.data.providerInfo.organization && (
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {' '}({resource.data.providerInfo.organization})
                  </Text>
                )}
              </Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactInfo}>
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              📞 {resource.data.providerInfo.phone} • ✉️ {resource.data.providerInfo.email}
            </Text>
          </View>

          {/* Tags */}
          {resource.data.tags && resource.data.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {resource.data.tags.slice(0, 4).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
              {resource.data.tags.length > 4 && (
                <Text style={[styles.moreTagsText, { color: theme.colors.textSecondary }]}>
                  +{resource.data.tags.length - 4} more
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {showActions && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={[
                styles.actionButtons,
                { borderTopColor: theme.colors.border }
              ]}
            >
              <PressableScale onPress={() => onToggleAvailability?.(resource)}>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
                    Toggle Status
                  </Text>
                </View>
              </PressableScale>

              {resource.data.status !== 'depleted' && (
                <PressableScale onPress={() => onMarkDepleted?.(resource)}>
                  <View
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.warning },
                    ]}
                  >
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                      Mark Depleted
                    </Text>
                  </View>
                </PressableScale>
              )}

              <PressableScale onPress={() => onDelete?.(resource)}>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.error },
                  ]}
                >
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                    Delete
                  </Text>
                </View>
              </PressableScale>
            </Animated.View>
          )}

          {/* Status Footer */}
          <View style={[styles.statusFooter, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
              Status: {resource.data.verificationStatus} • Created: {new Date(resource.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

export default function ResourcesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useFirebaseAuth();
  const insets = useSafeAreaInsets();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  const handleAddResource = useCallback(() => {
    // Check if user has completed profile for adding resources
    if (user && !user.hasCompletedProfile) {
      Alert.alert(
        'Profile Required',
        'You need to complete your profile before adding resources. This helps others understand your expertise and contact you if needed.',
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
    
    setShowAddModal(true);
  }, [user]);

  // All hooks must be called before any conditional returns
  const { 
    data: allResources = [], 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll,
    isRefetching: isRefetchingAll 
  } = useResources();

  const { 
    data: availableResources = [], 
    isLoading: isLoadingAvailable, 
    refetch: refetchAvailable,
    isRefetching: isRefetchingAvailable 
  } = useAvailableResources();

  const deleteResource = useDeleteResource();
  const toggleAvailability = useToggleResourceAvailability();
  const markDepleted = useMarkResourceDepleted();

  const handleRefresh = useCallback(async () => {
    console.log('[RESOURCES] Refreshing resources...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (filter === 'all') {
        await refetchAll();
      } else {
        await refetchAvailable();
      }
    } catch (error) {
      console.error('[RESOURCES] Refresh error:', error);
    }
  }, [filter, refetchAll, refetchAvailable]);

  const handleDeleteResource = useCallback((resource: Resource) => {
    Alert.alert(
      'DELETE RESOURCE',
      `Are you sure you want to delete "${resource.data.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteResource.mutateAsync(resource.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('[RESOURCES] Delete error:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete resource. Please try again.');
            }
          },
        },
      ]
    );
  }, [deleteResource]);

  const handleToggleAvailability = useCallback((resource: Resource) => {
    const statusOptions: ResourceData['availability']['status'][] = ['available', 'limited', 'reserved', 'unavailable'];
    const currentIndex = statusOptions.indexOf(resource.data.availability.status);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];

    Alert.alert(
      'CHANGE AVAILABILITY',
      `Change availability from "${resource.data.availability.status}" to "${nextStatus}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Change',
          onPress: async () => {
            try {
              await toggleAvailability.mutateAsync({
                resource,
                newStatus: nextStatus,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('[RESOURCES] Toggle error:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to update availability. Please try again.');
            }
          },
        },
      ]
    );
  }, [toggleAvailability]);

  const handleMarkDepleted = useCallback((resource: Resource) => {
    Alert.alert(
      'MARK AS DEPLETED',
      `Mark "${resource.data.title}" as depleted and unavailable?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Depleted',
          style: 'destructive',
          onPress: async () => {
            try {
              await markDepleted.mutateAsync(resource);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('[RESOURCES] Mark depleted error:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to mark resource as depleted. Please try again.');
            }
          },
        },
      ]
    );
  }, [markDepleted]);

  const renderResourceCard = useCallback(({ item }: { item: Resource }) => (
    <ResourceCard
      resource={item}
      onDelete={handleDeleteResource}
      onToggleAvailability={handleToggleAvailability}
      onMarkDepleted={handleMarkDepleted}
    />
  ), [handleDeleteResource, handleToggleAvailability, handleMarkDepleted]);

  const renderEmpty = useCallback(() => (
    <Animated.View 
      entering={FadeIn} 
      style={[styles.emptyContainer, { marginTop: 60 }]}
    >
      <Text style={[styles.emptyIcon, { fontSize: 64 }]}>📦</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Resources Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {filter === 'all' 
          ? 'Start by uploading your first resource to help others in need.'
          : 'No available resources at the moment. Check back later or switch to view all resources.'
        }
      </Text>
      {filter === 'all' && (
        <PressableScale onPress={handleAddResource}>
          <View style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.emptyButtonText, { color: theme.colors.onPrimary }]}>
              📦 Upload Resource
            </Text>
          </View>
        </PressableScale>
      )}
    </Animated.View>
  ), [filter, theme.colors, handleAddResource]);

  const renderHeader = useCallback(() => (
    <Animated.View layout={LinearTransition} style={styles.header}>
      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: theme.colors.surface }]}>
        <PressableScale onPress={() => setFilter('all')}>
          <View
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === 'all' ? theme.colors.primary : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: filter === 'all' ? theme.colors.onPrimary : theme.colors.textSecondary,
                },
              ]}
            >
              All Resources ({allResources.length})
            </Text>
          </View>
        </PressableScale>

        <PressableScale onPress={() => setFilter('available')}>
          <View
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === 'available' ? theme.colors.secondary : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: filter === 'available' ? theme.colors.onSecondary : theme.colors.textSecondary,
                },
              ]}
            >
              Available ({availableResources.length})
            </Text>
          </View>
        </PressableScale>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {allResources.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total
          </Text>
        </View>
        
        <View style={[styles.statSeparator, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {availableResources.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Available
          </Text>
        </View>
        
        <View style={[styles.statSeparator, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {allResources.filter(r => r.data.status === 'depleted').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Depleted
          </Text>
        </View>
        
        <View style={[styles.statSeparator, { backgroundColor: theme.colors.border }]} />
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {allResources.filter(r => r.data.priority === 'emergency').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Emergency
          </Text>
        </View>
      </View>
    </Animated.View>
  ), [filter, theme.colors, allResources.length, availableResources.length, allResources]);

  // Show admin dashboard for conflict controllers
  if (user?.role === 'conflict_controller') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: '🎛️ CONFLICT CONTROLLER DASHBOARD',
            headerStyle: { backgroundColor: theme.colors.surface } as any,
            headerTitleStyle: { 
              color: theme.colors.intel,
              fontFamily: 'Inter-Bold',
              fontSize: 16,
            } as any,
            headerBackTitle: 'Back',
          }}
        />
        <AdminDashboard />
      </SafeAreaView>
    );
  }

  const resources = filter === 'all' ? allResources : availableResources;
  const isLoading = filter === 'all' ? isLoadingAll : isLoadingAvailable;
  const isRefetching = filter === 'all' ? isRefetchingAll : isRefetchingAvailable;
  const error = filter === 'all' ? errorAll : null;

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: '📦 RESOURCES',
            headerStyle: { backgroundColor: theme.colors.surface } as any,
            headerTitleStyle: { 
              color: theme.colors.text,
              fontFamily: 'Inter-Bold',
            } as any,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Failed to load resources
          </Text>
          <PressableScale onPress={handleRefresh}>
            <View style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
                Retry
              </Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: '📦 RESOURCES',
          headerStyle: { backgroundColor: theme.colors.surface } as any,
          headerTitleStyle: { 
            color: theme.colors.text,
            fontFamily: 'Inter-Bold',
          } as any,
          headerBackTitle: 'Back',
          headerRight: () => (
            <PressableScale onPress={handleAddResource}>
              <View style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>
                  +
                </Text>
              </View>
            </PressableScale>
          ),
        }}
      />

      <FlatList
        data={resources}
        renderItem={renderResourceCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <AddResourceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  statSeparator: {
    width: StyleSheet.hairlineWidth,
    height: '60%',
    alignSelf: 'center',
    marginHorizontal: 8,
  },
  resourceCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  resourceHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceIcon: {
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  resourceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  resourceDetails: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  contactInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  contactText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  tag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  moreTagsText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statusFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    paddingTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
});