import { AddConflictModal } from '@/components/AddConflictModal';
import { ConflictMap } from '@/components/ConflictMap';
import { OperationsHeader } from '@/components/OperationsHeader';
import { RoleSelectionScreen } from '@/components/RoleSelectionScreen';
import { AuthenticationFlow } from '@/components/AuthenticationFlow';
import { PressableScale } from '@/components/ui/PressableScale';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useConflictZones, useLatestConflictData } from '@/hooks/useConflictData';
import { useSubmitConflict } from '@/hooks/useConflictSubmission';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { ConflictZone } from '@/types/conflict';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

type ConflictFilter = 'all' | 'critical' | 'verified' | 'active';

export default function Index() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading: authLoading, needsProfileSetup, logout } = useFirebaseAuth();
  const permissions = usePermissions();
  const [filters, setFilters] = useState(undefined);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAddConflictModal, setShowAddConflictModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConflictFilter>('all');
  
  // Animation values for cinematic effects
  const gridOverlay = useSharedValue(0);
  const screenGlow = useSharedValue(0);

  const { 
    data: conflicts = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useConflictZones(filters);

  const { mutate: fetchLatestData, isPending: isFetchingLatest } = useLatestConflictData();
  const { mutate: submitConflict, isPending: isSubmittingConflict } = useSubmitConflict();

  // Filter conflicts based on active filter
  const filteredConflicts = React.useMemo(() => {
    switch (activeFilter) {
      case 'critical':
        return conflicts.filter(c => c.severity === 'critical');
      case 'verified':
        return conflicts.filter(c => c.verified);
      case 'active':
        return conflicts.filter(c => c.status === 'active');
      case 'all':
      default:
        return conflicts;
    }
  }, [conflicts, activeFilter]);
  
  // Initialize cinematic animations
  useEffect(() => {
    // Grid overlay animation
    gridOverlay.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    
    // Screen glow effect
    screenGlow.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [gridOverlay, screenGlow]);
  
  // Update timestamp when data changes
  useEffect(() => {
    if (conflicts.length > 0) {
      setLastUpdate(new Date());
    }
  }, [conflicts]);

  // Animated styles - Must be declared before any early returns
  const gridOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(gridOverlay.value, [0, 1], [0.1, 0.3]);
    return { opacity };
  });
  
  const screenGlowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(screenGlow.value, [0, 1], [0.1, 0.4]);
    return { shadowOpacity };
  });

  const handleConflictPress = (conflict: ConflictZone) => {
    console.log('[CONFLICT TRACKING] Accessing conflict intel:', conflict.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to conflict details screen
    router.push(`/conflict/${conflict.id}`);
  };

  const handleRefresh = async () => {
    console.log('[CONFLICT TRACKING] Refreshing conflict data...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await refetch();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[CONFLICT TRACKING] Error refreshing data:', error);
      Alert.alert(
        'REFRESH FAILED',
        'Could not refresh conflict data. Please try again.',
        [{ text: 'ACKNOWLEDGED' }]
      );
    }
  };

  const handleFetchLatest = () => {
    console.log('[CONFLICT TRACKING] Fetching latest intel...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    fetchLatestData(undefined, {
      onSuccess: () => {
        setLastUpdate(new Date());
        Alert.alert(
          'REAL-TIME DATA NOT CONFIGURED',
          'Real-time data sources are not yet integrated. Only manually submitted conflicts are available.',
          [{ text: 'ACKNOWLEDGED' }]
        );
      },
      onError: () => {
        Alert.alert(
          'INTEL ACQUISITION FAILED',
          'Could not connect to real-time data sources. Please try refreshing existing data.',
          [{ text: 'ACKNOWLEDGED' }]
        );
      },
    });
  };

  const handleAddConflict = () => {
    console.log('[CONFLICT TRACKING] Opening conflict submission modal...');
    
    if (!permissions.canSubmitConflicts) {
      Alert.alert(
        'ACCESS RESTRICTED',
        'Your current role does not allow conflict reporting. OTG and Hand roles can submit conflicts.',
        [{ text: 'ACKNOWLEDGED' }]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAddConflictModal(true);
  };

  const handleLogout = async () => {
    console.log('[AUTH] User logout requested...');
    
    Alert.alert(
      'LOGOUT CONFIRMATION',
      'Are you sure you want to logout? You will need to re-authenticate to access the system.',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'LOGOUT',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              Alert.alert('LOGOUT FAILED', 'Could not logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSubmitConflict = async (conflictData: Partial<ConflictZone>) => {
    console.log('[CONFLICT TRACKING] Submitting new conflict report...');
    
    return new Promise<void>((resolve, reject) => {
      submitConflict(conflictData, {
        onSuccess: (response) => {
          if (response.success) {
            console.log('[CONFLICT TRACKING] Conflict submitted successfully');
            setLastUpdate(new Date());
            resolve();
          } else {
            reject(new Error(response.message || 'Submission failed'));
          }
        },
        onError: (error) => {
          console.error('[CONFLICT TRACKING] Error submitting conflict:', error);
          reject(error);
        },
      });
    });
  };

  const handleFilterPress = (filterType: ConflictFilter) => {
    console.log('[CONFLICT TRACKING] Applying filter:', filterType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Toggle filter - if clicking same filter, return to 'all'
    if (activeFilter === filterType) {
      setActiveFilter('all');
    } else {
      setActiveFilter(filterType);
    }
  };

  // Show authentication flow if not authenticated or needs profile setup
  if ((!user || needsProfileSetup) && !authLoading) {
    return <AuthenticationFlow />;
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Initializing Conflict Controller...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'CONFLICT TRACKING',
            headerShown: true,
            headerStyle: { 
              backgroundColor: theme.colors.surface,
            } as any,
            headerTitleStyle: { 
              color: theme.colors.intel,
              fontFamily: 'Inter-Bold',
              fontSize: 16,
            } as any,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Failed to load conflict data
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
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background }, screenGlowStyle]}>
      <StatusBar barStyle='light-content' backgroundColor={theme.colors.background} />
      
      <Stack.Screen 
        options={{
          title: `CONFLICT CONTROLLER - ${user?.role.toUpperCase() || 'GUEST'}`,
          headerShown: true,
          headerStyle: { 
            backgroundColor: theme.colors.surface,
          } as any,
          headerTitleStyle: { 
            color: theme.colors.intel,
            fontFamily: 'Inter-Bold',
            fontSize: 14,
          } as any,
          headerRight: () => (
            <View style={styles.headerButtons}>
              {permissions.canSubmitConflicts && (
                <PressableScale onPress={handleAddConflict}>
                  <View style={[styles.headerButton, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }]}>
                    <Text style={[styles.headerButtonText, { color: '#FFFFFF' }]}>
                      {isSubmittingConflict ? '⟳' : '📝'}
                    </Text>
                  </View>
                </PressableScale>
              )}
              
              {permissions.canViewResources && (
                <PressableScale onPress={() => router.push('/app/resources')}>
                  <View style={[styles.headerButton, { backgroundColor: theme.colors.success, borderColor: theme.colors.success }]}>
                    <Text style={[styles.headerButtonText, { color: '#FFFFFF' }]}>
                      📦
                    </Text>
                  </View>
                </PressableScale>
              )}
              
              {permissions.canViewNeeds && (
                <PressableScale onPress={() => router.push('/app/needs')}>
                  <View style={[styles.headerButton, { backgroundColor: theme.colors.warning, borderColor: theme.colors.warning }]}>
                    <Text style={[styles.headerButtonText, { color: '#FFFFFF' }]}>
                      🆘
                    </Text>
                  </View>
                </PressableScale>
              )}
              
              <PressableScale onPress={handleRefresh}>
                <View style={[styles.headerButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.intel }]}>
                  <Text style={[styles.headerButtonText, { color: theme.colors.onPrimary }]}>
                    {isRefetching ? '↻' : '⟳'}
                  </Text>
                </View>
              </PressableScale>
              
              <PressableScale onPress={handleFetchLatest}>
                <View style={[styles.headerButton, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.tactical }]}>
                  <Text style={[styles.headerButtonText, { color: theme.colors.onSecondary }]}>
                    {isFetchingLatest ? '●●●' : '📡'}
                  </Text>
                </View>
              </PressableScale>

              <PressableScale onPress={handleLogout}>
                <View style={[styles.headerButton, { backgroundColor: theme.colors.muted, borderColor: theme.colors.border }]}>
                  <Text style={[styles.headerButtonText, { color: theme.colors.text }]}>
                    🚪
                  </Text>
                </View>
              </PressableScale>
            </View>
          ),
        }}
      />

      {/* Operations Header */}
      <OperationsHeader 
        conflicts={conflicts} 
        lastUpdate={lastUpdate}
      />
      
      {/* Tactical Grid Overlay */}
      <Animated.View style={[styles.gridOverlay, gridOverlayStyle]} pointerEvents="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * 40, backgroundColor: theme.colors.grid }]} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 40, backgroundColor: theme.colors.grid }]} />
        ))}
      </Animated.View>

      <ConflictMap 
        conflicts={filteredConflicts}
        onConflictPress={handleConflictPress}
        onViewFullIntel={handleConflictPress}
        loading={isLoading}
      />
      
      {/* Tactical Status Panel */}
      {conflicts.length > 0 && (
        <View style={[styles.tacticalPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleContainer}>
              <Text style={[styles.panelTitle, { color: theme.colors.intel }]}>SITUATION BOARD</Text>
              {activeFilter !== 'all' && (
                <Text style={[styles.filterIndicator, { color: theme.colors.primary }]}>
                  • FILTERED: {activeFilter.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: theme.colors.tactical }]} />
          </View>
          
          <View style={styles.tacticalStats}>
            <PressableScale onPress={() => handleFilterPress('all')}>
              <View style={[
                styles.tacticalStatItem, 
                activeFilter === 'all' && styles.tacticalStatItemActive,
                activeFilter === 'all' && { backgroundColor: theme.colors.primary + '20' }
              ]}>
                <Text style={[
                  styles.tacticalStatValue, 
                  { color: activeFilter === 'all' ? theme.colors.primary : theme.colors.text }
                ]}>
                  {conflicts.length}
                </Text>
                <Text style={[
                  styles.tacticalStatLabel, 
                  { color: activeFilter === 'all' ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  ZONES
                </Text>
              </View>
            </PressableScale>
            
            <View style={[styles.tacticalStatSeparator, { backgroundColor: theme.colors.border }]} />
            
            <PressableScale onPress={() => handleFilterPress('critical')}>
              <View style={[
                styles.tacticalStatItem,
                activeFilter === 'critical' && styles.tacticalStatItemActive,
                activeFilter === 'critical' && { backgroundColor: theme.colors.error + '20' }
              ]}>
                <Text style={[
                  styles.tacticalStatValue, 
                  { color: activeFilter === 'critical' ? theme.colors.error : theme.colors.error }
                ]}>
                  {conflicts.filter(c => c.severity === 'critical').length}
                </Text>
                <Text style={[
                  styles.tacticalStatLabel, 
                  { color: activeFilter === 'critical' ? theme.colors.error : theme.colors.textSecondary }
                ]}>
                  CRITICAL
                </Text>
              </View>
            </PressableScale>
            
            <View style={[styles.tacticalStatSeparator, { backgroundColor: theme.colors.border }]} />
            
            <PressableScale onPress={() => handleFilterPress('verified')}>
              <View style={[
                styles.tacticalStatItem,
                activeFilter === 'verified' && styles.tacticalStatItemActive,
                activeFilter === 'verified' && { backgroundColor: theme.colors.intel + '20' }
              ]}>
                <Text style={[
                  styles.tacticalStatValue, 
                  { color: activeFilter === 'verified' ? theme.colors.intel : theme.colors.intel }
                ]}>
                  {conflicts.filter(c => c.verified).length}
                </Text>
                <Text style={[
                  styles.tacticalStatLabel, 
                  { color: activeFilter === 'verified' ? theme.colors.intel : theme.colors.textSecondary }
                ]}>
                  VERIFIED
                </Text>
              </View>
            </PressableScale>
            
            <View style={[styles.tacticalStatSeparator, { backgroundColor: theme.colors.border }]} />
            
            <PressableScale onPress={() => handleFilterPress('active')}>
              <View style={[
                styles.tacticalStatItem,
                activeFilter === 'active' && styles.tacticalStatItemActive,
                activeFilter === 'active' && { backgroundColor: theme.colors.warning + '20' }
              ]}>
                <Text style={[
                  styles.tacticalStatValue, 
                  { color: activeFilter === 'active' ? theme.colors.warning : theme.colors.warning }
                ]}>
                  {conflicts.filter(c => c.status === 'active').length}
                </Text>
                <Text style={[
                  styles.tacticalStatLabel, 
                  { color: activeFilter === 'active' ? theme.colors.warning : theme.colors.textSecondary }
                ]}>
                  ACTIVE
                </Text>
              </View>
            </PressableScale>
          </View>
        </View>
      )}


      {/* Add Conflict Modal */}
      <AddConflictModal
        visible={showAddConflictModal}
        onClose={() => setShowAddConflictModal(false)}
        onSubmit={handleSubmitConflict}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  tacticalPanel: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#30363D',
  },
  panelTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  filterIndicator: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tacticalStats: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tacticalStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  tacticalStatItemActive: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tacticalStatValue: {
    fontSize: 18,
    fontFamily: 'Inter-Black',
    lineHeight: 22,
  },
  tacticalStatLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tacticalStatSeparator: {
    width: StyleSheet.hairlineWidth,
    height: '60%',
    alignSelf: 'center',
    marginHorizontal: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exportModal: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: '90%',
    maxHeight: '70%',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  exportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportModalTitle: {
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
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  exportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
