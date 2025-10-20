import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    }}>
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <Text style={{
          fontSize: 56,
          marginBottom: theme.spacing.xl,
          textAlign: 'center',
        }}>
          🌍
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Text style={{
          fontSize: theme.fontSize['3xl'],
          fontWeight: '700',
          color: theme.colors.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
          fontFamily: 'Inter-Bold',
        }}>
          Welcome to{'\n'}Conflict Connect
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <Text style={{
          fontSize: theme.fontSize.lg,
          color: theme.colors.text,
          textAlign: 'center',
          lineHeight: theme.fontSize.lg * 1.5,
          fontFamily: 'Inter-Regular',
          marginBottom: theme.spacing.xl,
        }}>
          Our aim is to bring resources and attention to conflicts and trouble zones globally, operating on a peer-to-peer resource sharing level, alongside mutual aid and charities.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).springify()}>
        <Text style={{
          fontSize: theme.fontSize.base,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          fontFamily: 'Inter-Medium',
          marginTop: theme.spacing.xl,
        }}>
          Before you get started, let's have a look at what this app can do.
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(1000).springify()}
        style={{ 
          position: 'absolute',
          bottom: theme.spacing['2xl'],
        }}
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
    </View>
  );
};

