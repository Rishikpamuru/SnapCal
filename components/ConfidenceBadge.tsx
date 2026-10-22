import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/lib/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConfidenceBadgeProps {
  confidence: 'low' | 'medium' | 'high';
}

const CONFIG = {
  low: { bg: '#FEF3E2', color: Colors.confidenceLow, label: 'Low confidence' },
  medium: { bg: '#FEF9E7', color: Colors.confidenceMedium, label: 'Medium confidence' },
  high: { bg: Colors.accentLight, color: Colors.confidenceHigh, label: 'High confidence' },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const { bg, color, label } = CONFIG[confidence];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
  },
});
