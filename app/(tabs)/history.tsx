import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart } from '@/components/BarChart';
import { useMeals } from '@/context/MealsContext';
import { Colors, Fonts, FontSizes, Radius, Shadows, Spacing } from '@/lib/theme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { weeklyData, weekAverage, daysTrackedThisWeek, streak, settings, updateGoal } = useMeals();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());

  const saveGoal = async () => {
    const parsed = parseInt(goalInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 10000) {
      await updateGoal(parsed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setGoalInput(settings.dailyGoal.toString());
    }
    setEditingGoal(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Your week at a glance</Text>
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 7 Days</Text>
          <BarChart data={weeklyData} goal={settings.dailyGoal} />
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weekAverage.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Avg calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daysTrackedThisWeek}</Text>
            <Text style={styles.statLabel}>Days tracked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, streak > 0 && styles.streakValue]}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak {streak > 0 ? '🔥' : ''}</Text>
          </View>
        </Animated.View>

        {/* Goal Setting */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Daily Calorie Goal</Text>
            {!editingGoal && (
              <Pressable onPress={() => setEditingGoal(true)}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}
          </View>

          {editingGoal ? (
            <View style={styles.goalEditRow}>
              <TextInput
                style={styles.goalInput}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="number-pad"
                returnKeyType="done"
                autoFocus
                selectTextOnFocus
                onSubmitEditing={saveGoal}
              />
              <Text style={styles.goalUnit}>cal/day</Text>
              <Pressable onPress={saveGoal} style={styles.saveGoalBtn}>
                <Text style={styles.saveGoalText}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.goalValue}>{settings.dailyGoal.toLocaleString()} cal/day</Text>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
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
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  chartTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    ...Shadows.card,
  },
  statValue: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes.xl,
    color: Colors.text,
  },
  streakValue: {
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  editText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.accent,
  },
  goalValue: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['2xl'],
    color: Colors.text,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  goalInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes.xl,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  goalUnit: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  saveGoalBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  saveGoalText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
});
