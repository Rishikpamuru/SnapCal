import { Colors, Fonts, FontSizes, Radius, Spacing } from '@/lib/theme';
import type { DayData } from '@/lib/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BarChartProps {
  data: DayData[];
  goal: number;
  height?: number;
}

export function BarChart({ data, goal, height = 160 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.total), goal) * 1.15;
  const goalY = maxValue > 0 ? (1 - goal / maxValue) * height : height;

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {/* Goal line */}
        <View style={[styles.goalLine, { top: goalY }]}>
          <Text style={styles.goalLabel}>{goal.toLocaleString()}</Text>
          <View style={styles.goalDash} />
        </View>

        {/* Bars */}
        <View style={styles.barsRow}>
          {data.map((day) => {
            const barHeight = maxValue > 0 ? (day.total / maxValue) * height : 0;
            const isOverGoal = day.total > goal;
            const isEmpty = day.total === 0;

            return (
              <View key={day.date} style={styles.barColumn}>
                <View style={[styles.barTrack, { height }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, isEmpty ? 0 : 4),
                        backgroundColor: isEmpty
                          ? Colors.border
                          : isOverGoal
                          ? Colors.danger
                          : Colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                {day.total > 0 && (
                  <Text style={styles.valueLabel}>{day.total}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.lg,
  },
  chartArea: {
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  goalLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    minWidth: 36,
    textAlign: 'right',
  },
  goalDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    opacity: 0.3,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingLeft: 44,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: Radius.sm,
    minHeight: 0,
  },
  dayLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  valueLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
