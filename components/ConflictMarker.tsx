import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { ConflictZone, ConflictSeverity } from '@/types/conflict';
import { useTheme } from '@/hooks/useTheme';

interface ConflictMarkerProps {
  conflict: ConflictZone;
  size?: 'small' | 'medium' | 'large';
  isJittered?: boolean;
  groupSize?: number;
  groupIndex?: number;
}

export const ConflictMarker: React.FC<ConflictMarkerProps> = ({ 
  conflict, 
  size = 'medium',
  isJittered = false,
  groupSize = 1,
  groupIndex = 0
}) => {
  const theme = useTheme();

  // Animation values
  const pulseScale = useSharedValue(1);
  const radarSweep = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const sourcesBadgeScale = useSharedValue(0);

  const getSeverityColor = (severity?: ConflictSeverity): string => {
    switch (severity) {
      case 'critical':
        return theme.colors.error; // Bright red for critical
      case 'high':
        return theme.colors.hotspot; // Red-orange for high
      case 'medium':
        return theme.colors.warning; // Orange for medium
      case 'low':
        return theme.colors.tactical; // Green for low
      default:
        return theme.colors.secondary; // Gray for unknown
    }
  };

  const getStatusIndicator = (status: string): boolean => {
    return status === 'active' || status === 'escalating';
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

  // Initialize animations
  useEffect(() => {
    const isHotspot = conflict.severity === 'critical' || conflict.status === 'escalating';
    const isActive = getStatusIndicator(conflict.status);

    if (isHotspot) {
      // Pulsing effect for critical conflicts
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      
      // Radar sweep effect
      radarSweep.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }

    if (isActive) {
      // Glow effect for active conflicts
      glowIntensity.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }

    // Sources badge animation
    sourcesBadgeScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 150 })
      )
    );
  }, [conflict.severity, conflict.status]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
        };
      case 'large':
        return {
          width: 44,
          height: 44,
          borderRadius: 22,
          borderWidth: 3,
        };
      default:
        return {
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 2,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const severityColor = getSeverityColor(conflict.severity);
  const isActive = getStatusIndicator(conflict.status);
  const isHotspot = conflict.severity === 'critical' || conflict.status === 'escalating';

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const radarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(radarSweep.value, [0, 0.3, 0.7, 1], [0.8, 0.4, 0.2, 0]);
    const scale = interpolate(radarSweep.value, [0, 1], [1, 2.5]);
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glowIntensity.value, [0, 1], [0.3, 0.8]);
    
    return {
      shadowOpacity,
    };
  });

  const sourcesBadgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sourcesBadgeScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Radar sweep effect for hotspots */}
      {isHotspot && (
        <Animated.View
          style={[
            styles.radarSweep,
            sizeStyles,
            {
              borderColor: theme.colors.radar,
              borderWidth: StyleSheet.hairlineWidth * 2,
            },
            radarAnimatedStyle,
          ]}
        />
      )}

      {/* Main conflict marker */}
      <Animated.View
        style={[
          styles.marker,
          sizeStyles,
          {
            backgroundColor: severityColor,
            borderColor: conflict.verified ? theme.colors.intel : theme.colors.warning,
            shadowColor: severityColor,
          },
          isHotspot ? pulseAnimatedStyle : {},
          isActive ? glowAnimatedStyle : {},
        ]}
      >
        {/* Inner tactical indicator */}
        {isActive && (
          <View
            style={[
              styles.innerIndicator,
              {
                width: sizeStyles.width * 0.4,
                height: sizeStyles.height * 0.4,
                borderRadius: sizeStyles.borderRadius * 0.4,
                backgroundColor: theme.colors.tactical,
              },
            ]}
          />
        )}

        {/* Classified indicator for verified conflicts */}
        {conflict.verified && (
          <View
            style={[
              styles.classifiedDot,
              {
                backgroundColor: theme.colors.classified,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Sources counter badge */}
      {conflict.sources && conflict.sources.length > 0 && (
        <Animated.View
          style={[
            styles.sourcesBadge,
            sourcesBadgeAnimatedStyle,
          ]}
        >
          <Text style={[styles.sourcesCount, { color: theme.colors.background }]}>
            {conflict.sources.length}
          </Text>
          <Text style={styles.sourcesIcon}>
            {getSourceIcon(conflict.sources[0].type)}
          </Text>
        </Animated.View>
      )}

      {/* Intel confidence indicator */}
      {conflict.confidence && (
        <View
          style={[
            styles.confidenceBar,
            {
              backgroundColor: theme.colors.intel,
              width: `${conflict.confidence}%`,
            },
          ]}
        />
      )}

      {/* Group indicator for jittered markers */}
      {isJittered && groupSize > 1 && (
        <View style={[styles.groupIndicator, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.groupText, { color: theme.colors.onPrimary }]}>
            {groupSize}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    minHeight: 60,
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    position: 'relative',
  },
  innerIndicator: {
    opacity: 0.9,
  },
  radarSweep: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  classifiedDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: -2,
    right: -2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  sourcesBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#00FFFF', // Cyan intel color
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sourcesCount: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginRight: 2,
  },
  sourcesIcon: {
    fontSize: 8,
  },
  confidenceBar: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  groupIndicator: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  groupText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});