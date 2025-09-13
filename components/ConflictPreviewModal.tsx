import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { ConflictZone, RelatedCharity } from '@/types/conflict';
import { useTheme } from '@/hooks/useTheme';
import { PressableScale } from '@/components/ui/PressableScale';
import { format } from 'date-fns';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  getCharitiesForConflict, 
  getTrustworthinessColor, 
  getTrustworthinessText, 
  getFocusAreaEmoji 
} from '@/services/charityService';
import { usePrefetchConflictZone } from '@/hooks/useConflictData';

interface ConflictPreviewModalProps {
  conflict: ConflictZone | null;
  visible: boolean;
  onClose: () => void;
  onViewFullIntel: (conflict: ConflictZone) => void;
}

export const ConflictPreviewModal: React.FC<ConflictPreviewModalProps> = React.memo(({
  conflict,
  visible,
  onClose,
  onViewFullIntel,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [relevantCharities, setRelevantCharities] = useState<RelatedCharity[]>([]);
  const [loadingCharities, setLoadingCharities] = useState(false);
  const prefetchConflict = usePrefetchConflictZone();
  
  // Animation values
  const slideUpValue = useSharedValue(0);
  const backdropValue = useSharedValue(0);
  
  useEffect(() => {
    if (visible && conflict) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Prefetch full conflict details for faster loading
      if (conflict.id) {
        prefetchConflict(conflict.id);
      }
      
      // Slide up animation
      slideUpValue.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
      
      // Backdrop animation
      backdropValue.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      // Load charities in background
      loadCharitiesForConflict();
    } else {
      // Animate out
      slideUpValue.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      
      backdropValue.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible, conflict, prefetchConflict]);

  const loadCharitiesForConflict = async () => {
    if (!conflict) return;
    
    setLoadingCharities(true);
    try {
      if (conflict.relatedCharities) {
        setRelevantCharities(conflict.relatedCharities);
      } else {
        const charities = await getCharitiesForConflict(
          conflict.country, 
          conflict.region, 
          conflict.tags
        );
        setRelevantCharities(charities);
      }
    } catch (error) {
      console.error('Error loading charities for conflict:', error);
      setRelevantCharities([]);
    } finally {
      setLoadingCharities(false);
    }
  };

  const handleClose = () => {
    runOnJS(() => {
      Haptics.selectionAsync();
      onClose();
    })();
  };

  const handleViewFullIntel = () => {
    if (conflict) {
      runOnJS(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onViewFullIntel(conflict);
      })();
    }
  };

  const handleCharityPress = (charity: RelatedCharity) => {
    const url = charity.donationUrl || charity.websiteUrl;
    if (url) {
      Haptics.selectionAsync();
      Linking.openURL(url);
    }
  };

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropValue.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          slideUpValue.value,
          [0, 1],
          [400, 0]
        ),
      },
      {
        scale: interpolate(
          slideUpValue.value,
          [0, 1],
          [0.9, 1]
        ),
      },
    ],
    opacity: slideUpValue.value,
  }));

  if (!conflict) return null;

  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.hotspot;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.tactical;
      default:
        return theme.colors.secondary;
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return theme.colors.error;
      case 'escalating':
        return theme.colors.hotspot;
      case 'monitoring':
        return theme.colors.warning;
      case 'resolved':
        return theme.colors.tactical;
      default:
        return theme.colors.secondary;
    }
  };

  const getConflictTypeIcon = (conflictType: string): string => {
    switch (conflictType) {
      case 'military': return '⚔️';
      case 'protest': return '✊';
      case 'civil-unrest': return '🔥';
      case 'humanitarian': return '🏥';
      case 'environmental': return '🌍';
      case 'labor-dispute': return '⚒️';
      case 'ethnic-conflict': return '⚖️';
      case 'political': return '🏛️';
      case 'war': return '💥';
      case 'famine': return '🌾';
      default: return '📍';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    try {
      const now = new Date();
      const reportedTime = new Date(dateString);
      const diffMs = now.getTime() - reportedTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Time unknown';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
          <Animated.View 
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
              modalStyle,
            ]}
          >
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(conflict.severity) }]} />
                <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {conflict.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeButton, { backgroundColor: theme.colors.muted }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
            >
              {/* Quick info */}
              <View style={styles.quickInfoContainer}>
                <View style={styles.quickInfoRow}>
                  <View style={styles.quickInfoItem}>
                    <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Type</Text>
                    <View style={styles.quickInfoValue}>
                      <Text style={styles.quickInfoIcon}>{getConflictTypeIcon(conflict.conflictType || 'other')}</Text>
                      <Text style={[styles.quickInfoText, { color: theme.colors.text }]}>
                        {(conflict.conflictType || 'Unknown').replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.quickInfoItem}>
                    <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Status</Text>
                    <View style={styles.quickInfoValue}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(conflict.status) }]} />
                      <Text style={[styles.quickInfoText, { color: getStatusColor(conflict.status) }]}>
                        {(conflict.status || 'Unknown').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.quickInfoRow}>
                  <View style={styles.quickInfoItem}>
                    <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Location</Text>
                    <Text style={[styles.quickInfoText, { color: theme.colors.text }]} numberOfLines={1}>
                      📍 {conflict.location}{conflict.country && `, ${conflict.country}`}
                    </Text>
                  </View>
                  
                  <View style={styles.quickInfoItem}>
                    <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Reported</Text>
                    <Text style={[styles.quickInfoText, { color: theme.colors.textSecondary }]}>
                      🕐 {formatTimeAgo(conflict.dateReported)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              {conflict.description && (
                <View style={[styles.section, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
                  <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {conflict.description}
                  </Text>
                </View>
              )}

              {/* Casualties alert */}
              {conflict.casualties !== undefined && conflict.casualties > 0 && (
                <View style={[styles.casualtyAlert, { 
                  backgroundColor: theme.colors.error + '15',
                  borderColor: theme.colors.error 
                }]}>
                  <Text style={[styles.casualtyIcon, { color: theme.colors.error }]}>⚠️</Text>
                  <Text style={[styles.casualtyText, { color: theme.colors.error }]}>
                    {conflict.casualties} casualties reported
                  </Text>
                </View>
              )}

              {/* Sources */}
              {conflict.sources && conflict.sources.length > 0 && (
                <View style={[styles.section, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Intelligence Sources ({conflict.sources.length})
                  </Text>
                  <View style={styles.sourcesContainer}>
                    {conflict.sources.slice(0, 3).map((source, index) => (
                      <View key={index} style={[styles.sourceChip, { 
                        backgroundColor: theme.colors.primary + '20',
                        borderColor: theme.colors.primary 
                      }]}>
                        <Text style={[styles.sourceText, { color: theme.colors.primary }]}>
                          📡 {source.type.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                    {conflict.sources.length > 3 && (
                      <View style={[styles.sourceChip, { 
                        backgroundColor: theme.colors.textSecondary + '20',
                        borderColor: theme.colors.textSecondary 
                      }]}>
                        <Text style={[styles.sourceText, { color: theme.colors.textSecondary }]}>
                          +{conflict.sources.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Aid Organizations */}
              {(relevantCharities.length > 0 || loadingCharities) && (
                <View style={[styles.section, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Aid Organizations
                  </Text>
                  
                  {loadingCharities ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading organizations...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {relevantCharities.slice(0, 2).map((charity, index) => (
                        <PressableScale key={index} onPress={() => handleCharityPress(charity)}>
                          <View style={[styles.charityCard, { 
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border 
                          }]}>
                            <View style={styles.charityHeader}>
                              <Text style={[styles.charityName, { color: theme.colors.text }]} numberOfLines={1}>
                                {charity.name}
                                {charity.verifiedStatus && (
                                  <Text style={[styles.verifiedBadge, { color: theme.colors.success }]}> ✓</Text>
                                )}
                              </Text>
                              <View style={[styles.trustBadge, { 
                                backgroundColor: getTrustworthinessColor(charity.trustworthinessRating) + '20' 
                              }]}>
                                <Text style={[styles.trustScore, { 
                                  color: getTrustworthinessColor(charity.trustworthinessRating) 
                                }]}>
                                  {charity.trustworthinessRating.toFixed(1)}
                                </Text>
                              </View>
                            </View>
                            
                            <Text style={[styles.charityDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                              {charity.description}
                            </Text>
                            
                            {charity.focusAreas && charity.focusAreas.length > 0 && (
                              <View style={styles.focusAreasContainer}>
                                {charity.focusAreas.slice(0, 3).map((area, areaIndex) => (
                                  <View key={areaIndex} style={[styles.focusAreaTag, { 
                                    backgroundColor: theme.colors.primary + '15',
                                    borderColor: theme.colors.primary + '30' 
                                  }]}>
                                    <Text style={styles.focusAreaEmoji}>{getFocusAreaEmoji(area)}</Text>
                                    <Text style={[styles.focusAreaText, { color: theme.colors.primary }]}>
                                      {area.toLowerCase()}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                            
                            <Text style={[styles.donateHint, { color: theme.colors.primary }]}>
                              Tap to donate →
                            </Text>
                          </View>
                        </PressableScale>
                      ))}
                    </>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom action */}
            <View style={[styles.bottomAction, { 
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
              paddingBottom: insets.bottom 
            }]}>
              <PressableScale onPress={handleViewFullIntel}>
                <View style={[styles.fullIntelButton, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.fullIntelButtonText, { color: theme.colors.onPrimary }]}>
                    🎯 View Full Intel
                  </Text>
                </View>
              </PressableScale>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
});
ConflictPreviewModal.displayName = 'ConflictPreviewModal';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdropTouchable: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    lineHeight: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    lineHeight: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  quickInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quickInfoItem: {
    flex: 1,
    marginRight: 16,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickInfoValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickInfoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  quickInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  casualtyAlert: {
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  casualtyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  casualtyText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sourceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  charityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  charityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  charityName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  verifiedBadge: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  trustBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 36,
  },
  trustScore: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  charityDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 8,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  focusAreaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  focusAreaEmoji: {
    fontSize: 10,
    marginRight: 4,
  },
  focusAreaText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  donateHint: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fullIntelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullIntelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
});