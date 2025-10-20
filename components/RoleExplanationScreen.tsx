import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const RoleExplanationScreen: React.FC = () => {
  const theme = useTheme();

  const roleOptions = [
    {
      icon: '🔍',
      title: 'Scanner',
      description: 'Want to see what is happening around the world, live, on the Conflict Scanner?',
      action: "Choose 'Scanner' mode on the following screen.",
      color: '#3B82F6',
    },
    {
      icon: '🚨',
      title: 'On The Ground (OTG)',
      description: 'Are you On The Ground and in a conflict zone and need help?',
      action: "Choose the 'OTG' selection in the next screen.",
      additionalInfo: 'Also choose this if you are a mutual aid organisation REQUESTING resources on behalf of the people on the ground.',
      color: '#EF4444',
    },
    {
      icon: '🤝',
      title: 'Hand',
      description: 'Are you watching conflicts from across the globe, wondering how you can lend a helping Hand?',
      action: "Choose the 'Hand' selection, and let us know what you can provide.",
      color: '#10B981',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: theme.spacing['2xl'] }}
    >
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text style={{
          fontSize: theme.fontSize['3xl'],
          fontWeight: '700',
          color: theme.colors.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
          fontFamily: 'Inter-Bold',
        }}>
          Why are you here?
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text style={{
          fontSize: theme.fontSize.base,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: theme.spacing['2xl'],
          fontFamily: 'Inter-Regular',
        }}>
          Choose the role that best describes you
        </Text>
      </Animated.View>

      {roleOptions.map((role, index) => (
        <Animated.View
          key={role.title}
          entering={FadeInDown.delay(600 + index * 150).springify()}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: role.color,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Text style={{ fontSize: 32, marginRight: theme.spacing.md }}>
              {role.icon}
            </Text>
            <Text style={{
              fontSize: theme.fontSize.xl,
              fontWeight: '700',
              color: theme.colors.text,
              fontFamily: 'Inter-Bold',
              flex: 1,
            }}>
              {role.title}
            </Text>
          </View>

          <Text style={{
            fontSize: theme.fontSize.base,
            color: theme.colors.text,
            lineHeight: theme.fontSize.base * 1.4,
            marginBottom: theme.spacing.sm,
            fontFamily: 'Inter-Regular',
          }}>
            {role.description}
          </Text>

          <View style={{
            backgroundColor: role.color + '15',
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginTop: theme.spacing.sm,
          }}>
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: role.color,
              fontWeight: '600',
              fontFamily: 'Inter-SemiBold',
            }}>
              {role.action}
            </Text>
          </View>

          {role.additionalInfo && (
            <Text style={{
              fontSize: theme.fontSize.sm,
              color: theme.colors.textSecondary,
              fontStyle: 'italic',
              marginTop: theme.spacing.sm,
              fontFamily: 'Inter-Regular',
            }}>
              {role.additionalInfo}
            </Text>
          )}
        </Animated.View>
      ))}

      <Animated.View 
        entering={FadeInDown.delay(1200).springify()}
        style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl }}
      >
        <Text style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.textTertiary,
          textAlign: 'center',
          fontFamily: 'Inter-Regular',
        }}>
          Swipe to continue →
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

