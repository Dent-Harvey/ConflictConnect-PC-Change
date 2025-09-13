import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing,
  withSequence
} from 'react-native-reanimated';
import { ConflictZone } from '@/types/conflict';
import { useTheme } from '@/hooks/useTheme';

interface OperationsHeaderProps {
  conflicts: ConflictZone[];
  lastUpdate?: Date;
}

export const OperationsHeader: React.FC<OperationsHeaderProps> = ({ 
  conflicts, 
  lastUpdate 
}) => {
  const theme = useTheme();

  // Animation values
  const statusPulse = useSharedValue(0);
  const scanLine = useSharedValue(0);
  const dataFlow = useSharedValue(0);

  useEffect(() => {
    // Status pulse animation
    statusPulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // Scan line animation
    scanLine.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Data flow animation
    dataFlow.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  // Calculate statistics
  const stats = {
    total: conflicts.length,
    active: conflicts.filter(c => c.status === 'active').length,
    critical: conflicts.filter(c => c.severity === 'critical').length,
    verified: conflicts.filter(c => c.verified).length,
  };

  const threatLevel = () => {
    if (stats.critical > 0) return 'DEFCON 1';
    if (stats.active > 3) return 'DEFCON 2';
    if (stats.active > 1) return 'DEFCON 3';
    return 'DEFCON 4';
  };

  const getThreatColor = () => {
    const level = threatLevel();
    switch (level) {
      case 'DEFCON 1': return theme.colors.error;
      case 'DEFCON 2': return theme.colors.hotspot;
      case 'DEFCON 3': return theme.colors.warning;
      default: return theme.colors.tactical;
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'NEVER';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}S AGO`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}M AGO`;
    return `${Math.floor(diffSecs / 3600)}H AGO`;
  };

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(statusPulse.value, [0, 1], [0.5, 1]);
    return { opacity };
  });

  const scanLineAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scanLine.value, [0, 1], [-50, 300]);
    const opacity = interpolate(scanLine.value, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 0]);
    
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  const dataFlowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dataFlow.value,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Scan line effect */}
      <View style={styles.scanLineContainer}>
        <Animated.View 
          style={[
            styles.scanLine, 
            { backgroundColor: theme.colors.radar },
            scanLineAnimatedStyle
          ]} 
        />
      </View>

      {/* Main header content */}
      <View style={styles.headerContent}>
        {/* Left section - Operations status */}
        <View style={styles.leftSection}>
          <Text style={[styles.titleMain, { color: theme.colors.intel }]}>
            CONFLICT TRACKING
          </Text>
          <View style={styles.statusRow}>
            <Animated.View 
              style={[
                styles.threatIndicator, 
                { backgroundColor: getThreatColor() },
                pulseAnimatedStyle
              ]} 
            />
            <Text style={[styles.threatLevel, { color: getThreatColor() }]}>
              {threatLevel()}
            </Text>
          </View>
        </View>

        {/* Center section - Statistics grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              TOTAL
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>
              {stats.active}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              ACTIVE
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.hotspot }]}>
              {stats.critical}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              CRITICAL
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.intel }]}>
              {stats.verified}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              VERIFIED
            </Text>
          </View>
        </View>

        {/* Right section - System status */}
        <View style={styles.rightSection}>
          <View style={styles.systemStatus}>
            <Animated.View 
              style={[
                styles.dataFlowDot,
                { backgroundColor: theme.colors.tactical },
                dataFlowAnimatedStyle
              ]}
            />
            <Text style={[styles.systemText, { color: theme.colors.textSecondary }]}>
              LIVE FEED
            </Text>
          </View>
          <Text style={[styles.lastUpdate, { color: theme.colors.textSecondary }]}>
            LAST UPDATE: {formatLastUpdate()}
          </Text>
        </View>
      </View>

      {/* Data stream bars */}
      <View style={styles.dataStreamBars}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dataBar,
              { 
                backgroundColor: theme.colors.grid,
                height: Math.random() * 12 + 4,
              },
              dataFlowAnimatedStyle
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    overflow: 'hidden',
  },
  scanLine: {
    width: 2,
    height: '100%',
    position: 'absolute',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  leftSection: {
    flex: 1,
  },
  titleMain: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  threatLevel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 40,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Black',
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dataFlowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  systemText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  lastUpdate: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.3,
  },
  dataStreamBars: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dataBar: {
    width: 2,
    borderRadius: 1,
  },
});