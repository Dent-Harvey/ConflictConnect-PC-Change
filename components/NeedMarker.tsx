import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { UserNeed } from '@/services/userNeedsService';

interface NeedMarkerProps {
  need: UserNeed;
  size?: number;
}

export const NeedMarker: React.FC<NeedMarkerProps> = ({
  need,
  size = 24,
}) => {
  const theme = useTheme();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return '#4CAF50'; // Green
      case 'water':
        return '#2196F3'; // Blue
      case 'medical':
        return '#F44336'; // Red
      case 'shelter':
        return '#FF9800'; // Orange
      case 'transportation':
        return '#9C27B0'; // Purple
      case 'communication':
        return '#607D8B'; // Blue Grey
      case 'security':
        return '#795548'; // Brown
      case 'supplies':
        return '#FFEB3B'; // Yellow
      case 'evacuation':
        return '#E91E63'; // Pink
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityRing = (priority: string) => {
    switch (priority) {
      case 'emergency':
      case 'critical':
        return 3;
      case 'high':
        return 2;
      case 'medium':
        return 1;
      default:
        return 0;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return '🍞';
      case 'water':
        return '💧';
      case 'medical':
        return '🏥';
      case 'shelter':
        return '🏠';
      case 'transportation':
        return '🚗';
      case 'communication':
        return '📡';
      case 'security':
        return '🛡️';
      case 'supplies':
        return '📦';
      case 'evacuation':
        return '🚨';
      default:
        return '❓';
    }
  };

  const categoryColor = getCategoryColor(need.category);
  const priorityRing = getPriorityRing(need.priority);
  const categoryIcon = getCategoryIcon(need.category);

  const styles = StyleSheet.create({
    container: {
      width: size + (priorityRing * 4),
      height: size + (priorityRing * 4),
      alignItems: 'center',
      justifyContent: 'center',
    },
    outerRing: {
      position: 'absolute',
      width: size + (priorityRing * 4),
      height: size + (priorityRing * 4),
      borderRadius: (size + (priorityRing * 4)) / 2,
      borderWidth: priorityRing > 0 ? 2 : 0,
      borderColor: need.priority === 'emergency' || need.priority === 'critical' 
        ? theme.colors.error 
        : need.priority === 'high' 
        ? '#FF6B35' 
        : '#FFB800',
    },
    marker: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: categoryColor,
      borderWidth: 2,
      borderColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconText: {
      fontSize: size * 0.4,
      textAlign: 'center',
    },
    pulseAnimation: {
      position: 'absolute',
      width: size + 8,
      height: size + 8,
      borderRadius: (size + 8) / 2,
      backgroundColor: categoryColor,
      opacity: 0.3,
    },
  });

  return (
    <View style={styles.container}>
      {priorityRing > 0 && <View style={styles.outerRing} />}
      {(need.priority === 'emergency' || need.priority === 'critical') && (
        <View style={styles.pulseAnimation} />
      )}
      <View style={styles.marker}>
        <Text style={styles.iconText}>
          {categoryIcon}
        </Text>
      </View>
    </View>
  );
};