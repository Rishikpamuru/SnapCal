import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CircularProgress } from '@/components/CircularProgress';
import { MealCard } from '@/components/MealCard';
import { useMeals } from '@/context/MealsContext';
import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';

export default function TodayView() {
  const insets = useSafeAreaInsets();
  const { todayMeals, todayTotal, settings, loading, removeMeal, refreshMeals } = useMeals();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMeals();
    setRefreshing(false);
  };

  const remaining = Math.max(settings.dailyGoal - todayTotal, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.greeting}>SnapCal</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>

        {/* Progress Ring */}
        <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.progressSection}>
          <CircularProgress current={todayTotal} goal={settings.dailyGoal} />
          <Text style={styles.remainingText}>
            {todayTotal >= settings.dailyGoal
              ? `${todayTotal - settings.dailyGoal} calories over goal`
              : `${remaining} calories remaining`}
          </Text>
        </Animated.View>

        {/* Add Meal Button */}
        <View style={styles.addButtonRow}>
          <Button
            title="+ Add Meal"
            onPress={() => router.push('/(tabs)/add')}
            size="lg"
          />
        </View>

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
          {todayMeals.length === 0 && !loading ? (
            <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽</Text>
              <Text style={styles.emptyText}>No meals logged yet today</Text>
              <Text style={styles.emptySubtext}>Snap a photo of your meal to get started</Text>
            </Animated.View>
          ) : (
            todayMeals.map((meal, index) => (
              <MealCard
                key={meal.id}
                meal={meal}
                index={index}
                onDelete={removeMeal}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['2xl'],
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  remainingText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  addButtonRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mealsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyText: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  emptySubtext: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
