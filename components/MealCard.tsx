import { Colors, Fonts, FontSizes, Radius, Shadows, Spacing } from '@/lib/theme';
import type { MealEntry } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { ConfidenceBadge } from './ConfidenceBadge';

interface MealCardProps {
  meal: MealEntry;
  index: number;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, index, onDelete }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Remove meal',
      `Remove "${meal.meal_name}" from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete(meal.id) },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={[styles.card, expanded && styles.cardExpanded]}
      >
        <View style={styles.row}>
          {meal.photo_base64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${meal.photo_base64}` }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumb]}>
              <Text style={styles.placeholderEmoji}>🍽</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.mealName} numberOfLines={1}>{meal.meal_name}</Text>
            <Text style={styles.time}>{formatTime(meal.timestamp)}</Text>
          </View>
          <View style={styles.calorieBox}>
            <Text style={styles.calories}>{meal.calories}</Text>
            <Text style={styles.calLabel}>cal</Text>
          </View>
        </View>

        {expanded && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            exiting={FadeOut.duration(150)}
            style={styles.expandedContent}
          >
            <ConfidenceBadge confidence={meal.confidence} />
            <Text style={styles.breakdown}>{meal.breakdown}</Text>
            <Pressable onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Remove this meal</Text>
            </Pressable>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardExpanded: {
    ...Shadows.cardHover,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
  },
  placeholderThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mealName: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.base,
    color: Colors.text,
  },
  time: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calorieBox: {
    alignItems: 'flex-end',
  },
  calories: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes.xl,
    color: Colors.text,
  },
  calLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  expandedContent: {
    marginTop: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  breakdown: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  deleteBtn: {
    marginTop: Spacing.base,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  deleteText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.danger,
  },
});
