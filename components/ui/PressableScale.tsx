import React from 'react'
import {Pressable, PressableProps, StyleProp, ViewStyle} from 'react-native'
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const DEFAULT_TARGET_SCALE = 0.98;
const DEFAULT_DURATION = 80;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function PressableScale({
  targetScale = DEFAULT_TARGET_SCALE,
  duration = DEFAULT_DURATION,
  children,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: {
  targetScale?: number
  duration?: number
  style?: StyleProp<ViewStyle>
} & Exclude<PressableProps, 'onPressIn' | 'onPressOut' | 'style'>) {
  const reducedMotion = useReducedMotion()

  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }))

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={e => {
        'worklet'
        if (onPressIn) {
          runOnJS(onPressIn)(e)
        }
        cancelAnimation(scale)
        scale.value = withTiming(targetScale, {duration: duration})
      }}
      onPressOut={e => {
        'worklet'
        if (onPressOut) {
          runOnJS(onPressOut)(e)
        }
        cancelAnimation(scale)
        scale.value = withTiming(1, {duration: duration})
      }}
      style={[!reducedMotion && animatedStyle, style]}
      {...rest}>
      {children}
    </AnimatedPressable>
  )
}