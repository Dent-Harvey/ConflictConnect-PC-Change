import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { SuggestedNeed } from '@/services/suggestedNeedsService';

interface SuggestedNeedsCardProps {
  suggestions: SuggestedNeed[];
  onAddSuggestion: (suggestion: SuggestedNeed) => void;
  conflictZoneName?: string;
}

const SuggestionCard: React.FC<{
  suggestion: SuggestedNeed;
  onPress: () => void;
}> = ({ suggestion, onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water':
        return '💧';
      case 'food':
        return '🍞';
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
        return '🚁';
      default:
        return '❓';
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginRight: theme.spacing.md,
      width: 280,
      borderWidth: theme.borderRadius.hairline,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    icon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    priorityTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    priorityText: {
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    description: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
    },
    details: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    quantity: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      fontFamily: 'Inter-Medium',
      color: theme.colors.text,
    },
    urgency: {
      fontSize: theme.fontSize.sm,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
    },
    reason: {
      fontSize: theme.fontSize.xs,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.md,
      lineHeight: 16,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
  });

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(150)} 
      layout={LinearTransition.duration(200)}
    >
      <PressableScale style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text style={styles.icon}>{getCategoryIcon(suggestion.category)}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{suggestion.title}</Text>
            <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
              <Text style={styles.priorityText}>{suggestion.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {suggestion.description}
        </Text>

        <View style={styles.details}>
          <Text style={styles.quantity}>
            {suggestion.quantity} {suggestion.unit}
          </Text>
          <Text style={styles.urgency}>
            {suggestion.urgency.replace('_', ' ')}
          </Text>
        </View>

        <Text style={styles.reason} numberOfLines={2}>
          💡 {suggestion.reason}
        </Text>

        <PressableScale 
          style={styles.addButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }}
          duration={100}
        >
          <Text style={styles.addButtonText}>{t('needs.addSuggestion')}</Text>
        </PressableScale>
      </PressableScale>
    </Animated.View>
  );
};

export const SuggestedNeedsCard: React.FC<SuggestedNeedsCardProps> = ({
  suggestions,
  onAddSuggestion,
  conflictZoneName,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (suggestions.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      fontFamily: 'Inter-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    scrollContainer: {
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.sm,
    },
    zoneHighlight: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontFamily: 'Inter-SemiBold',
    },
  });

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      layout={LinearTransition.duration(200)} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('needs.suggestedTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('needs.suggestedSubtitle').replace('{zoneName}', conflictZoneName || 'this conflict zone')}
        </Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={296} // card width + margin
        snapToAlignment="start"
      >
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onPress={() => onAddSuggestion(suggestion)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};