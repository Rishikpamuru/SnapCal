import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export function LoadingOverlay() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const duration = 500;
    dot1.value = withRepeat(
      withSequence(withTiming(1, { duration }), withTiming(0.3, { duration })),
      -1,
      false
    );
    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(withTiming(1, { duration }), withTiming(0.3, { duration })),
        -1,
        false
      )
    );
    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(withTiming(1, { duration }), withTiming(0.3, { duration })),
        -1,
        false
      )
    );
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Analyzing your meal</Text>
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, style1]} />
        <Animated.View style={[styles.dot, style2]} />
        <Animated.View style={[styles.dot, style3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  text: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
});
