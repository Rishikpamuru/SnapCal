import { Colors, Fonts, FontSizes, Radius, Shadows, Spacing } from '@/lib/theme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const bgColor =
    variant === 'primary'
      ? Colors.accent
      : variant === 'danger'
      ? Colors.danger
      : Colors.surface;

  const textColor =
    variant === 'secondary' ? Colors.text : '#FFFFFF';

  const borderStyle =
    variant === 'secondary' ? { borderWidth: 1.5, borderColor: Colors.border } : {};

  const sizeStyle =
    size === 'sm'
      ? styles.sizeSm
      : size === 'lg'
      ? styles.sizeLg
      : styles.sizeMd;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        sizeStyle,
        { backgroundColor: bgColor },
        borderStyle,
        variant === 'primary' && Shadows.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, size === 'sm' && styles.textSm]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizeSm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  sizeMd: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sizeLg: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.base,
  },
  textSm: {
    fontSize: FontSizes.sm,
  },
});
