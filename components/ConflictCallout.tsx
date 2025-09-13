import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withRepeat
} from 'react-native-reanimated';
import { ConflictZone, RelatedCharity } from '@/types/conflict';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';
import { PressableScale } from '@/components/ui/PressableScale';
import { 
  getCharitiesForConflict, 
  getTrustworthinessColor, 
  getTrustworthinessText, 
  getFocusAreaEmoji 
} from '@/services/charityService';

interface ConflictCalloutProps {
  conflict: ConflictZone;
  onDetailsPress: () => void;
  isJittered?: boolean;
  groupSize?: number;
}

export const ConflictCallout: React.FC<ConflictCalloutProps> = ({
  conflict,
  onDetailsPress,
  isJittered = false,
  groupSize = 1,
}) => {
  const theme = useTheme();
  const [relevantCharities, setRelevantCharities] = useState<RelatedCharity[]>([]);
  
  // Load relevant charities for this conflict
  useEffect(() => {
    const loadCharities = async () => {
      if (conflict.relatedCharities) {
        setRelevantCharities(conflict.relatedCharities);
      } else {
        try {
          const charities = await getCharitiesForConflict(conflict.country, conflict.region, conflict.tags);
          setRelevantCharities(charities);
        } catch (error) {
          console.error('Error loading charities for conflict:', error);
          setRelevantCharities([]);
        }
      }
    };
    
    loadCharities();
  }, [conflict.country, conflict.region, conflict.tags, conflict.relatedCharities]);
  
  // Animation values for tactical feel
  const slideIn = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const dataStream = useSharedValue(0);

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
  
  const getSourceIcon = (source: string): string => {
    switch (source.toLowerCase()) {
      case 'twitter':
      case 'x':
        return '𝕏';
      case 'telegram':
        return '✈️';
      case 'news':
        return '📰';
      case 'satellite':
        return '🛰️';
      case 'intel':
        return '🎯';
      default:
        return '📡';
    }
  };
  
  const getThreatLevel = (): string => {
    if (conflict.severity === 'critical') return 'ALPHA';
    if (conflict.severity === 'high') return 'BRAVO';
    if (conflict.severity === 'medium') return 'CHARLIE';
    if (conflict.severity === 'low') return 'DELTA';
    return 'ECHO';
  };

  const getConflictTypeColor = (conflictType: string): string => {
    switch (conflictType) {
      case 'military': return '#DC2626'; // Red
      case 'protest': return '#7C3AED'; // Purple
      case 'civil-unrest': return '#EA580C'; // Orange
      case 'humanitarian': return '#059669'; // Green
      case 'environmental': return '#0D9488'; // Teal
      case 'labor-dispute': return '#CA8A04'; // Yellow
      case 'ethnic-conflict': return '#B91C1C'; // Dark Red
      case 'political': return '#1D4ED8'; // Blue
      case 'war': return '#7F1D1D'; // Dark Red
      case 'famine': return '#92400E'; // Brown
      default: return theme.colors.textSecondary;
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

  const getProtestTypeColor = (protestType: string): string => {
    switch (protestType) {
      case 'peaceful': return '#10B981'; // Green
      case 'violent': return '#DC2626'; // Red
      case 'mixed': return '#F59E0B'; // Amber
      case 'civil-disobedience': return '#8B5CF6'; // Violet
      default: return theme.colors.textSecondary;
    }
  };

  const getProtestTypeIcon = (protestType: string): string => {
    switch (protestType) {
      case 'peaceful': return '🕊️';
      case 'violent': return '💥';
      case 'mixed': return '⚠️';
      case 'civil-disobedience': return '🚫';
      default: return '👥';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy • HH:mm');
    } catch {
      return 'TIMESTAMP UNKNOWN';
    }
  };
  
  const formatTimeAgo = (dateString: string): string => {
    try {
      const now = new Date();
      const reportedTime = new Date(dateString);
      const diffMs = now.getTime() - reportedTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 60) return `T-${diffMins}M`;
      if (diffHours < 24) return `T-${diffHours}H`;
      return `T-${Math.floor(diffHours / 24)}D`;
    } catch {
      return 'T-∞';
    }
  };

  const handleCharityPress = (charity: RelatedCharity) => {
    const url = charity.donationUrl || charity.websiteUrl;
    if (url) {
      Linking.openURL(url);
    }
  };
  
  // Initialize animations
  useEffect(() => {
    // Slide in animation
    slideIn.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.back(1.2)),
    });
    
    // Glow pulse for critical/active conflicts
    if (conflict.severity === 'critical' || conflict.status === 'active') {
      glowPulse.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
    
    // Data stream animation
    dataStream.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, [conflict.severity, conflict.status]);
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateY: interpolate(slideIn.value, [0, 1], [50, 0])
        },
        {
          scale: interpolate(slideIn.value, [0, 1], [0.9, 1])
        }
      ],
      opacity: slideIn.value,
    };
  });
  
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glowPulse.value, [0, 1], [0.3, 0.8]);
    
    return {
      shadowOpacity: glowOpacity,
    };
  });
  
  const dataStreamAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(dataStream.value, [0, 1], [-100, 300]);
    
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        containerAnimatedStyle,
        (conflict.severity === 'critical' || conflict.status === 'active') ? glowAnimatedStyle : {},
      ]}
    >
      {/* Tactical header with threat level */}
      <View style={[styles.tacticalHeader, { backgroundColor: theme.colors.muted }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.threatLevel, { color: getSeverityColor(conflict.severity) }]}>
            ■ {getThreatLevel()}
          </Text>
          <Text style={[styles.classification, { color: theme.colors.intel }]}>
            {conflict.verified ? 'VERIFIED' : 'UNCONFIRMED'}
          </Text>
        </View>
        <Text style={[styles.timeAgo, { color: theme.colors.textSecondary }]}>
          {formatTimeAgo(conflict.dateReported)}
        </Text>
      </View>
      
      {/* Animated data stream effect */}
      <View style={styles.dataStreamContainer}>
        <Animated.View style={[styles.dataStream, dataStreamAnimatedStyle]} />
      </View>

      <View style={styles.header}>
        <Text 
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {conflict.title}
        </Text>
        {conflict.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.intel }]}>
            <Text style={styles.verifiedText}>🎯</Text>
          </View>
        )}
      </View>

      {conflict.location && (
        <View style={styles.locationRow}>
          <Text style={[styles.locationLabel, { color: theme.colors.intel }]}>
            COORDINATES:
          </Text>
          <Text style={[styles.location, { color: theme.colors.text }]}>
            {conflict.location}{conflict.country && `, ${conflict.country}`}
          </Text>
          {isJittered && groupSize > 1 && (
            <Text style={[styles.jitterNotice, { color: theme.colors.warning }]}>
              ⚠️ {groupSize} CONFLICTS AT THIS LOCATION (MARKERS SPREAD FOR VISIBILITY)
            </Text>
          )}
        </View>
      )}

      {/* Tactical status grid */}
      <View style={[styles.tacticalGrid, { backgroundColor: theme.colors.muted }]}>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>THREAT</Text>
          <View style={styles.gridValueRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getSeverityColor(conflict.severity) }]} />
            <Text style={[styles.gridValue, { color: getSeverityColor(conflict.severity) }]}>
              {(conflict.severity || 'UNKNOWN').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>STATUS</Text>
          <View style={styles.gridValueRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(conflict.status) }]} />
            <Text style={[styles.gridValue, { color: getStatusColor(conflict.status) }]}>
              {(conflict.status || 'UNKNOWN').toUpperCase()}
            </Text>
          </View>
        </View>
        
        {conflict.confidence && (
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>CONFIDENCE</Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { 
                    width: `${conflict.confidence}%`,
                    backgroundColor: theme.colors.intel 
                  }
                ]} 
              />
              <Text style={[styles.confidenceText, { color: theme.colors.intel }]}>
                {conflict.confidence}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Conflict Type and Protest Information */}
      <View style={styles.typeInfoSection}>
        {conflict.conflictType && (
          <View style={[styles.typeChip, { backgroundColor: getConflictTypeColor(conflict.conflictType) + '20', borderColor: getConflictTypeColor(conflict.conflictType) }]}>
            <Text style={[styles.typeText, { color: getConflictTypeColor(conflict.conflictType) }]}>
              {getConflictTypeIcon(conflict.conflictType)} {conflict.conflictType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        )}
        
        {conflict.protestType && (
          <View style={[styles.protestChip, { backgroundColor: getProtestTypeColor(conflict.protestType) + '20', borderColor: getProtestTypeColor(conflict.protestType) }]}>
            <Text style={[styles.protestText, { color: getProtestTypeColor(conflict.protestType) }]}>
              {getProtestTypeIcon(conflict.protestType)} {conflict.protestType.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        )}
        
        {conflict.realTimeUpdates && (
          <View style={[styles.realTimeIndicator, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}>
            <Text style={[styles.realTimeText, { color: theme.colors.success }]}>
              🔴 LIVE MONITORING
            </Text>
          </View>
        )}
      </View>

      {conflict.casualties !== undefined && conflict.casualties > 0 && (
        <View style={[styles.casualtiesAlert, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error }]}>
          <Text style={[styles.casualtiesIcon, { color: theme.colors.error }]}>⚠️</Text>
          <Text style={[styles.casualties, { color: theme.colors.error }]}>
            CASUALTIES: {conflict.casualties} REPORTED
          </Text>
        </View>
      )}

      {/* Sources intelligence panel */}
      {conflict.sources && conflict.sources.length > 0 && (
        <View style={[styles.sourcesPanel, { backgroundColor: theme.colors.muted }]}>
          <Text style={[styles.sourcesLabel, { color: theme.colors.intel }]}>INTEL SOURCES</Text>
          <View style={styles.sourcesGrid}>
            {conflict.sources.slice(0, 4).map((source, index) => (
              <View key={index} style={[styles.sourceChip, { backgroundColor: theme.colors.intel + '20', borderColor: theme.colors.intel }]}>
                <Text style={styles.sourceIcon}>{getSourceIcon(source.type)}</Text>
                <Text style={[styles.sourceText, { color: theme.colors.intel }]}>
                  {source.type.toUpperCase()}
                </Text>
              </View>
            ))}
            {conflict.sources.length > 4 && (
              <View style={[styles.sourceChip, { backgroundColor: theme.colors.textSecondary + '20', borderColor: theme.colors.textSecondary }]}>
                <Text style={[styles.sourceText, { color: theme.colors.textSecondary }]}>
                  +{conflict.sources.length - 4}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Related Charities Panel */}
      {relevantCharities && relevantCharities.length > 0 && (
        <View style={[styles.charitiesPanel, { backgroundColor: theme.colors.muted }]}>
          <Text style={[styles.charitiesLabel, { color: theme.colors.intel }]}>AID ORGANIZATIONS</Text>
          {relevantCharities.slice(0, 2).map((charity, index) => (
            <PressableScale key={index} onPress={() => handleCharityPress(charity)}>
              <View style={[styles.charityCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.charityHeader}>
                  <Text style={[styles.charityName, { color: theme.colors.text }]} numberOfLines={1}>
                    {charity.name}
                    {charity.verifiedStatus && (
                      <Text style={[styles.verifiedIndicator, { color: theme.colors.intel }]}> ✓</Text>
                    )}
                  </Text>
                  <View style={[styles.trustRatingContainer, { backgroundColor: getTrustworthinessColor(charity.trustworthinessRating) + '20' }]}>
                    <Text style={[styles.trustRating, { color: getTrustworthinessColor(charity.trustworthinessRating) }]}>
                      {charity.trustworthinessRating.toFixed(1)}
                    </Text>
                    <Text style={[styles.trustLabel, { color: getTrustworthinessColor(charity.trustworthinessRating) }]}>
                      {getTrustworthinessText(charity.trustworthinessRating)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.charityDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {charity.description}
                </Text>
                
                {charity.focusAreas && charity.focusAreas.length > 0 && (
                  <View style={styles.focusAreas}>
                    {charity.focusAreas.slice(0, 3).map((area, areaIndex) => (
                      <View key={areaIndex} style={[styles.focusArea, { backgroundColor: theme.colors.intel + '15', borderColor: theme.colors.intel + '30' }]}>
                        <Text style={styles.focusAreaEmoji}>{getFocusAreaEmoji(area)}</Text>
                        <Text style={[styles.focusAreaText, { color: theme.colors.intel }]}>
                          {area.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <Text style={[styles.donateHint, { color: theme.colors.primary }]}>
                  → TAP TO DONATE
                </Text>
              </View>
            </PressableScale>
          ))}
          {relevantCharities.length > 2 && (
            <Text style={[styles.moreCharities, { color: theme.colors.textSecondary }]}>
              +{relevantCharities.length - 2} more organizations available
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.metadata}>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          REPORTED: {formatDate(conflict.dateReported)}
        </Text>
      </View>

      <PressableScale onPress={onDetailsPress}>
        <View style={[styles.detailsButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.intel }]}>
          <Text style={[styles.detailsButtonText, { color: theme.colors.onPrimary }]}>
            ► ACCESS FULL INTEL
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    padding: 0,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  tacticalHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#30363D',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginRight: 12,
  },
  classification: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  dataStreamContainer: {
    height: 2,
    overflow: 'hidden',
    backgroundColor: '#21262D',
  },
  dataStream: {
    height: 2,
    width: 100,
    backgroundColor: '#00FFFF',
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  locationRow: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
  jitterNotice: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  tacticalGrid: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#30363D',
  },
  gridItem: {
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  gridValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridValue: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    backgroundColor: '#161B22',
    borderRadius: 2,
    paddingHorizontal: 4,
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 2,
    opacity: 0.3,
  },
  confidenceText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    zIndex: 1,
  },
  casualtiesAlert: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  casualtiesIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  casualties: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  sourcesPanel: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#30363D',
  },
  sourcesLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sourceIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  sourceText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
  },
  metadata: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  date: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
  },
  detailsButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailsButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  charitiesPanel: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#30363D',
  },
  charitiesLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  charityCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  charityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  charityName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.2,
  },
  verifiedIndicator: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  trustRatingContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
    minWidth: 40,
  },
  trustRating: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
  },
  trustLabel: {
    fontSize: 7,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  charityDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    lineHeight: 14,
    marginBottom: 6,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  focusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  focusAreaEmoji: {
    fontSize: 8,
    marginRight: 3,
  },
  focusAreaText: {
    fontSize: 7,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
  },
  donateHint: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  moreCharities: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // New styles for conflict types and protest information
  typeInfoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 6,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  protestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  protestText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  realTimeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
});