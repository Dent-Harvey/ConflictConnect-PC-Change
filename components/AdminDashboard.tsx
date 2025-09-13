import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  Layout,
  LinearTransition
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useResources } from '@/hooks/useResources';
import { useUserNeeds } from '@/hooks/useUserNeeds';
import { useAuth } from '@/contexts/AuthContext';
import { Resource } from '@/services/resourcesService';
import { UserNeed } from '@/services/userNeedsService';

interface AdminActivityItem {
  id: string;
  type: 'resource_request' | 'resource_added' | 'need_created' | 'resource_fulfilled';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  user: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  timestamp: string;
  priority?: string;
  status?: string;
  category?: string;
}

interface AdminStatsProps {
  resources: Resource[];
  needs: UserNeed[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ resources, needs }) => {
  const theme = useTheme();

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      color: theme.colors.primary,
      icon: '📦',
    },
    {
      label: 'Available Now',
      value: resources.filter(r => r.data.availability.status === 'available').length,
      color: theme.colors.success,
      icon: '✅',
    },
    {
      label: 'Active Needs',
      value: needs.filter(n => n.status === 'open').length,
      color: theme.colors.warning,
      icon: '🆘',
    },
    {
      label: 'Critical Priority',
      value: needs.filter(n => n.priority === 'critical' || n.priority === 'emergency').length,
      color: theme.colors.error,
      icon: '🚨',
    },
    {
      label: 'Fulfilled',
      value: needs.filter(n => n.status === 'fulfilled').length,
      color: theme.colors.intel,
      icon: '🎯',
    },
    {
      label: 'Resource Types',
      value: new Set(resources.map(r => r.data.category)).size,
      color: theme.colors.secondary,
      icon: '🔗',
    },
  ];

  return (
    <View style={[styles.statsGrid, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.statsHeader}>
        <Text style={[styles.statsTitle, { color: theme.colors.intel }]}>ADMIN OVERVIEW</Text>
        <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success }]} />
      </View>
      
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

interface ResourceLocationCardProps {
  resource: Resource;
  onViewDetails: (resource: Resource) => void;
  onContactUser: (resource: Resource) => void;
}

const ResourceLocationCard: React.FC<ResourceLocationCardProps> = ({ 
  resource, 
  onViewDetails,
  onContactUser 
}) => {
  const theme = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return theme.colors.error;
      case 'high': return '#FF6B35';
      case 'medium': return '#FFB800';
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.colors.success;
      case 'limited': return '#FFB800';
      case 'reserved': return theme.colors.primary;
      case 'unavailable': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
    >
      <View style={[styles.resourceLocationCard, { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border,
        borderLeftColor: getPriorityColor(resource.data.priority)
      }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.categoryIcon}>
              {resource.data.category === 'food' ? '🍞' :
               resource.data.category === 'water' ? '💧' :
               resource.data.category === 'medical' ? '🏥' :
               resource.data.category === 'shelter' ? '🏠' :
               resource.data.category === 'transportation' ? '🚗' : '📦'}
            </Text>
            <Text style={[styles.resourceTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {resource.data.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(resource.data.availability.status) }]}>
              <Text style={styles.statusText}>
                {resource.data.availability.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {resource.data.description}
          </Text>
        </View>

        {/* Provider Info */}
        <View style={[styles.providerSection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.intel }]}>PROVIDER DETAILS</Text>
          <View style={styles.providerInfo}>
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Name:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.text }]}>
                {resource.data.providerInfo.name}
              </Text>
            </View>
            {resource.data.providerInfo.organization && (
              <View style={styles.providerDetail}>
                <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Org:</Text>
                <Text style={[styles.providerValue, { color: theme.colors.text }]}>
                  {resource.data.providerInfo.organization}
                </Text>
              </View>
            )}
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Phone:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.primary }]}>
                {resource.data.providerInfo.phone}
              </Text>
            </View>
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.primary }]}>
                {resource.data.providerInfo.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Resource Details */}
        <View style={styles.resourceDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Quantity:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.data.quantity} {resource.data.unit}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.data.type}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Priority:</Text>
              <Text style={[styles.detailValue, { color: getPriorityColor(resource.data.priority) }]}>
                {resource.data.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Verified:</Text>
              <Text style={[styles.detailValue, { color: resource.data.verificationStatus === 'verified' ? theme.colors.success : theme.colors.warning }]}>
                {resource.data.verificationStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Info */}
        {resource.data.location && (
          <View style={[styles.locationSection, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.intel }]}>LOCATION</Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              📍 {resource.data.location.address || `${resource.data.location.latitude.toFixed(4)}, ${resource.data.location.longitude.toFixed(4)}`}
            </Text>
            <Text style={[styles.coordinatesText, { color: theme.colors.textSecondary }]}>
              Coordinates: {resource.data.location.latitude.toFixed(6)}, {resource.data.location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { borderTopColor: theme.colors.border }]}>
          <PressableScale onPress={() => onContactUser(resource)}>
            <View style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                📞 Contact Provider
              </Text>
            </View>
          </PressableScale>
          <PressableScale onPress={() => onViewDetails(resource)}>
            <View style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}>
              <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
                📋 Full Details
              </Text>
            </View>
          </PressableScale>
        </View>

        {/* Timestamp Footer */}
        <View style={[styles.timestampFooter, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.timestampText, { color: theme.colors.textSecondary }]}>
            Added: {new Date(resource.created_at).toLocaleDateString()} at {new Date(resource.created_at).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

interface NeedRequestCardProps {
  need: UserNeed;
  onViewDetails: (need: UserNeed) => void;
  onContactUser: (need: UserNeed) => void;
}

const NeedRequestCard: React.FC<NeedRequestCardProps> = ({ need, onViewDetails, onContactUser }) => {
  const theme = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': case 'critical': return theme.colors.error;
      case 'high': return '#FF6B35';
      case 'medium': return '#FFB800';
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return theme.colors.success;
      case 'in_progress': case 'partially_fulfilled': return '#FFB800';
      case 'open': return theme.colors.primary;
      case 'cancelled': case 'expired': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
    >
      <View style={[styles.needRequestCard, { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.border,
        borderLeftColor: getPriorityColor(need.priority)
      }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.categoryIcon}>🆘</Text>
            <Text style={[styles.resourceTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {need.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(need.status) }]}>
              <Text style={styles.statusText}>
                {need.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {need.description}
          </Text>
        </View>

        {/* Need Details */}
        <View style={styles.resourceDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Category:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {need.category}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Quantity:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {need.quantity} {need.unit || 'units'}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Priority:</Text>
              <Text style={[styles.detailValue, { color: getPriorityColor(need.priority) }]}>
                {need.priority.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Urgency:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.warning }]}>
                {need.urgency.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Requester Info */}
        <View style={[styles.providerSection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.intel }]}>REQUESTER DETAILS</Text>
          <View style={styles.providerInfo}>
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Name:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.text }]}>
                {need.contactInfo?.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>Contact:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.primary }]}>
                {need.contactInfo?.preferredContact || 'App'}
              </Text>
            </View>
            <View style={styles.providerDetail}>
              <Text style={[styles.providerLabel, { color: theme.colors.textSecondary }]}>User ID:</Text>
              <Text style={[styles.providerValue, { color: theme.colors.textSecondary }]}>
                {need.userId}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Info */}
        {need.location && (
          <View style={[styles.locationSection, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.intel }]}>LOCATION</Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              📍 Location coordinates available
            </Text>
            <Text style={[styles.coordinatesText, { color: theme.colors.textSecondary }]}>
              Coordinates: {need.location.latitude.toFixed(6)}, {need.location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { borderTopColor: theme.colors.border }]}>
          <PressableScale onPress={() => onContactUser(need)}>
            <View style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                📞 Contact Requester
              </Text>
            </View>
          </PressableScale>
          <PressableScale onPress={() => onViewDetails(need)}>
            <View style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}>
              <Text style={[styles.actionButtonText, { color: theme.colors.onSecondary }]}>
                📋 Full Details
              </Text>
            </View>
          </PressableScale>
        </View>

        {/* Timestamp Footer */}
        <View style={[styles.timestampFooter, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.timestampText, { color: theme.colors.textSecondary }]}>
            Created: {new Date(need.createdAt || '').toLocaleDateString()} at {new Date(need.createdAt || '').toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'resources' | 'needs'>('resources');

  const { data: resources = [], isLoading: resourcesLoading } = useResources();
  const { data: needs = [], isLoading: needsLoading } = useUserNeeds();

  const handleContactUser = useCallback((item: Resource | UserNeed) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    let contactInfo: string;
    let title: string;
    
    if ('data' in item && 'providerInfo' in item.data) {
      // Resource
      const resource = item as Resource;
      contactInfo = `${resource.data.providerInfo.name}\nPhone: ${resource.data.providerInfo.phone}\nEmail: ${resource.data.providerInfo.email}`;
      title = `Contact Resource Provider`;
    } else {
      // Need
      const need = item as UserNeed;
      contactInfo = `${need.contactInfo?.name || 'Unknown'}\nUser ID: ${need.userId}\nPreferred Contact: ${need.contactInfo?.preferredContact || 'App'}`;
      title = `Contact Need Requester`;
    }

    Alert.alert(
      title,
      contactInfo,
      [
        { text: 'Copy Contact Info', onPress: () => {
          // In a real app, you'd copy to clipboard
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }},
        { text: 'Close', style: 'cancel' }
      ]
    );
  }, []);

  const handleViewDetails = useCallback((item: Resource | UserNeed) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    let details: string;
    let title: string;
    
    if ('data' in item && 'providerInfo' in item.data) {
      // Resource
      const resource = item as Resource;
      details = `Resource: ${resource.data.title}\nCategory: ${resource.data.category}\nType: ${resource.data.type}\nQuantity: ${resource.data.quantity} ${resource.data.unit}\nPriority: ${resource.data.priority}\nStatus: ${resource.data.availability.status}\nVerification: ${resource.data.verificationStatus}\nProvider: ${resource.data.providerInfo.name}\nOrganization: ${resource.data.providerInfo.organization || 'N/A'}\nPhone: ${resource.data.providerInfo.phone}\nEmail: ${resource.data.providerInfo.email}\nAdded: ${new Date(resource.created_at).toLocaleString()}`;
      title = 'Resource Details';
    } else {
      // Need
      const need = item as UserNeed;
      details = `Need: ${need.title}\nCategory: ${need.category}\nQuantity: ${need.quantity} ${need.unit || 'units'}\nPriority: ${need.priority}\nUrgency: ${need.urgency}\nStatus: ${need.status}\nRequester: ${need.contactInfo?.name || 'Unknown'}\nUser ID: ${need.userId}\nContact: ${need.contactInfo?.preferredContact || 'App'}\nCreated: ${new Date(need.createdAt || '').toLocaleString()}`;
      title = 'Need Details';
    }

    Alert.alert(title, details, [{ text: 'Close' }]);
  }, []);

  const renderResourceItem = useCallback(({ item }: { item: Resource }) => (
    <ResourceLocationCard
      resource={item}
      onViewDetails={handleViewDetails}
      onContactUser={handleContactUser}
    />
  ), [handleViewDetails, handleContactUser]);

  const renderNeedItem = useCallback(({ item }: { item: UserNeed }) => (
    <NeedRequestCard
      need={item}
      onViewDetails={handleViewDetails}
      onContactUser={handleContactUser}
    />
  ), [handleViewDetails, handleContactUser]);

  const renderEmpty = useCallback(() => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {activeTab === 'resources' ? '📦' : '🆘'}
      </Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No {activeTab === 'resources' ? 'Resources' : 'Needs'} Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {activeTab === 'resources' 
          ? 'No resources have been added to the system yet.'
          : 'No needs have been requested yet.'
        }
      </Text>
    </Animated.View>
  ), [activeTab, theme.colors]);

  if (user?.role !== 'conflict_controller') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.error }]}>Access Denied</Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
          This dashboard is only available to conflict controllers.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Overview */}
      <AdminStats resources={resources} needs={needs} />

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <PressableScale onPress={() => setActiveTab('resources')}>
          <View style={[
            styles.tab,
            { backgroundColor: activeTab === 'resources' ? theme.colors.primary : 'transparent' }
          ]}>
            <Text style={[
              styles.tabText,
              { color: activeTab === 'resources' ? theme.colors.onPrimary : theme.colors.textSecondary }
            ]}>
              📦 Resources ({resources.length})
            </Text>
          </View>
        </PressableScale>
        
        <PressableScale onPress={() => setActiveTab('needs')}>
          <View style={[
            styles.tab,
            { backgroundColor: activeTab === 'needs' ? theme.colors.secondary : 'transparent' }
          ]}>
            <Text style={[
              styles.tabText,
              { color: activeTab === 'needs' ? theme.colors.onSecondary : theme.colors.textSecondary }
            ]}>
              🆘 Needs ({needs.length})
            </Text>
          </View>
        </PressableScale>
      </View>

      {/* Content */}
      {activeTab === 'resources' ? (
        <FlatList<Resource>
          data={resources}
          renderItem={renderResourceItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <FlatList<UserNeed>
          data={needs}
          renderItem={renderNeedItem}
          keyExtractor={(item) => item.id || 'unknown'}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    margin: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#30363D',
  },
  statsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  resourceLocationCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  needRequestCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resourceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  providerSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  providerInfo: {
    gap: 4,
  },
  providerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    width: 60,
  },
  providerValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  resourceDetails: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    width: 70,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  locationSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  timestampFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
    paddingTop: 8,
  },
  timestampText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
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
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});