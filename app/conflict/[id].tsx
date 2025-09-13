import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useConflictZone } from '@/hooks/useConflictData';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';
import { ConflictSource, ConflictSeverity, RelatedCharity } from '@/types/conflict';
import { PressableScale } from '@/components/ui/PressableScale';
import { 
  getCharitiesForConflict, 
  getTrustworthinessColor, 
  getTrustworthinessText, 
  getFocusAreaEmoji 
} from '@/services/charityService';
import * as Haptics from 'expo-haptics';

export default function ConflictDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [relevantCharities, setRelevantCharities] = useState<RelatedCharity[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(true);

  // Handle both string and string array from useLocalSearchParams
  const conflictId = Array.isArray(id) ? id[0] : id;
  console.log('Conflict details page - ID param:', conflictId);

  const { data: conflict, isLoading, error, refetch } = useConflictZone(conflictId);

  // Load relevant charities when conflict data is available
  useEffect(() => {
    const loadCharities = async () => {
      if (!conflict) return;
      
      setCharitiesLoading(true);
      try {
        if (conflict.relatedCharities) {
          setRelevantCharities(conflict.relatedCharities);
        } else {
          const charities = await getCharitiesForConflict(conflict.country, conflict.region, conflict.tags);
          setRelevantCharities(charities);
        }
      } catch (error) {
        console.error('Error loading charities for conflict:', error);
        setRelevantCharities([]);
      } finally {
        setCharitiesLoading(false);
      }
    };
    
    loadCharities();
  }, [conflict]);

  const getSeverityColor = (severity?: ConflictSeverity): string => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#D97706';
      case 'low':
        return '#65A30D';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'active':
        return '#DC2626';
      case 'escalating':
        return '#EA580C';
      case 'monitoring':
        return '#D97706';
      case 'resolved':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return 'Invalid date';
    }
  };

  const handleSourcePress = async (source: ConflictSource) => {
    console.log('Opening source:', source.url);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const supported = await Linking.canOpenURL(source.url);
    
    if (supported) {
      await Linking.openURL(source.url);
    } else {
      Alert.alert('Error', 'Cannot open this link');
    }
  };

  const handleCharityPress = async (charity: RelatedCharity) => {
    console.log('Opening charity:', charity.name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const url = charity.donationUrl || charity.websiteUrl;
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Loading...',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.text },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading conflict details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conflictId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Invalid Conflict',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.text },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Invalid conflict ID provided
          </Text>
          <PressableScale onPress={() => router.back()}>
            <View style={[styles.backButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.backButtonText, { color: theme.colors.onPrimary }]}>
                Go Back
              </Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!isLoading && !conflict)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Error',
            headerShown: true,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.text },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error?.message || 'Could not load conflict details'}
          </Text>
          <PressableScale onPress={() => refetch()}>
            <View style={[styles.backButton, { backgroundColor: theme.colors.primary, marginBottom: 12 }]}>
              <Text style={[styles.backButtonText, { color: theme.colors.onPrimary }]}>
                Try Again
              </Text>
            </View>
          </PressableScale>
          <PressableScale onPress={() => router.back()}>
            <View style={[styles.backButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
              <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
                Go Back
              </Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  if (!conflict) {
    return null; // This should be handled by the loading/error states above
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{
          title: conflict.title,
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { 
            color: theme.colors.text,
            fontFamily: 'Inter-SemiBold',
            fontSize: 16,
          },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {conflict.title}
            </Text>
            {conflict.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          {conflict.location && (
            <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
              📍 {conflict.location}
              {conflict.region && `, ${conflict.region}`}
              {conflict.country && `, ${conflict.country}`}
            </Text>
          )}

          {/* Status Indicators */}
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getSeverityColor(conflict.severity) }
                ]}
              />
              <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
                {conflict.severity || 'Unknown'} Severity
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(conflict.status) }
                ]}
              />
              <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
                {conflict.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {conflict.description && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {conflict.description}
            </Text>
          </View>
        )}

        {/* Key Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Key Details
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Reported:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDate(conflict.dateReported)}
            </Text>
          </View>

          {conflict.lastUpdated && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Last Updated:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatDate(conflict.lastUpdated)}
              </Text>
            </View>
          )}

          {conflict.casualties !== undefined && conflict.casualties > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                Casualties:
              </Text>
              <Text style={[styles.detailValue, { color: '#DC2626' }]}>
                {conflict.casualties} reported
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Coordinates:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {conflict.latitude.toFixed(6)}, {conflict.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Involved Parties */}
        {conflict.involvedParties && conflict.involvedParties.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Involved Parties
            </Text>
            {conflict.involvedParties.map((party, index) => (
              <Text 
                key={index} 
                style={[styles.listItem, { color: theme.colors.textSecondary }]}
              >
                • {party}
              </Text>
            ))}
          </View>
        )}

        {/* Tags */}
        {conflict.tags && conflict.tags.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {conflict.tags.map((tag, index) => (
                <View 
                  key={index} 
                  style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
                >
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Aid Organizations */}
        {(() => {
          if (charitiesLoading) {
            return (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Aid Organizations
                </Text>
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 20 }} />
              </View>
            );
          }
          
          if (relevantCharities && relevantCharities.length > 0) {
            return (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Aid Organizations ({relevantCharities.length})
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  Trusted organizations providing humanitarian assistance in this conflict zone
                </Text>
                {relevantCharities.map((charity, index) => (
                  <PressableScale key={index} onPress={() => handleCharityPress(charity)}>
                    <View style={[styles.charityCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                      <View style={styles.charityHeader}>
                        <View style={styles.charityTitleContainer}>
                          <Text style={[styles.charityName, { color: theme.colors.text }]} numberOfLines={1}>
                            {charity.name}
                          </Text>
                          {charity.verifiedStatus && (
                            <View style={[styles.verifiedIndicator, { backgroundColor: theme.colors.primary }]}>
                              <Text style={styles.verifiedIndicatorText}>✓ VERIFIED</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.trustRatingContainer, { backgroundColor: getTrustworthinessColor(charity.trustworthinessRating) + '20' }]}>
                          <Text style={[styles.trustRating, { color: getTrustworthinessColor(charity.trustworthinessRating) }]}>
                            {charity.trustworthinessRating.toFixed(1)}
                          </Text>
                          <Text style={[styles.trustLabel, { color: getTrustworthinessColor(charity.trustworthinessRating) }]}>
                            {getTrustworthinessText(charity.trustworthinessRating)}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.charityDescription, { color: theme.colors.textSecondary }]}>
                        {charity.description}
                      </Text>
                      
                      {charity.focusAreas && charity.focusAreas.length > 0 && (
                        <View style={styles.focusAreas}>
                          {charity.focusAreas.map((area, areaIndex) => (
                            <View key={areaIndex} style={[styles.focusArea, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}>
                              <Text style={styles.focusAreaEmoji}>{getFocusAreaEmoji(area)}</Text>
                              <Text style={[styles.focusAreaText, { color: theme.colors.primary }]}>
                                {area}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      
                      <View style={styles.charityFooter}>
                        <Text style={[styles.donateHint, { color: theme.colors.primary }]}>
                          → Tap to donate or learn more
                        </Text>
                        {charity.registrationNumber && (
                          <Text style={[styles.registrationNumber, { color: theme.colors.textSecondary }]}>
                            Reg: {charity.registrationNumber}
                          </Text>
                        )}
                      </View>
                    </View>
                  </PressableScale>
                ))}
              </View>
            );
          }
          return null;
        })()}

        {/* Sources */}
        {conflict.sources && conflict.sources.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sources ({conflict.sources.length})
            </Text>
            {conflict.sources.map((source, index) => (
              <PressableScale 
                key={index} 
                onPress={() => handleSourcePress(source)}
              >
                <View style={[styles.sourceItem, { borderColor: theme.colors.border }]}>
                  <View style={styles.sourceHeader}>
                    <Text style={[styles.sourceType, { color: theme.colors.text }]}>
                      {source.type.toUpperCase()}
                    </Text>
                    <View style={styles.credibilityContainer}>
                      <Text style={[styles.credibilityLabel, { color: theme.colors.textSecondary }]}>
                        Credibility:
                      </Text>
                      <Text style={[styles.credibilityValue, { color: theme.colors.primary }]}>
                        {source.credibility}/10
                      </Text>
                    </View>
                  </View>
                  <Text 
                    style={[styles.sourceUrl, { color: theme.colors.primary }]}
                    numberOfLines={2}
                  >
                    {source.url}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
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
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  headerSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    flex: 1,
    marginRight: 12,
  },
  verifiedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  location: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 2,
    textAlign: 'right',
  },
  listItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  sourceItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceType: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  credibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credibilityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  credibilityValue: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  sourceUrl: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 40,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  charityCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  charityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  charityTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  charityName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    lineHeight: 22,
  },
  verifiedIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  trustRatingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  trustRating: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.3,
  },
  trustLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  charityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  focusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  focusAreaEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  focusAreaText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  charityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donateHint: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },
  registrationNumber: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
});