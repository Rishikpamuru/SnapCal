import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ current, goal, size = 200, strokeWidth = 12 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / Math.max(goal, 1), 1);

  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const isOverGoal = current > goal;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOverGoal ? Colors.danger : Colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.currentText,
            isOverGoal && { color: Colors.danger },
          ]}
        >
          {current.toLocaleString()}
        </Animated.Text>
        <Animated.Text style={styles.goalText}>
          of {goal.toLocaleString()} cal
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  currentText: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['3xl'],
    color: Colors.text,
    lineHeight: FontSizes['3xl'] * 1.1,
  },
  goalText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
