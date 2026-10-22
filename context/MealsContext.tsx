import { storage } from '@/lib/storage';
import type { DayData, MealEntry, UserSettings } from '@/lib/types';
import { calculateStreak, getLast7DaysData, isToday } from '@/lib/utils';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface MealsContextValue {
  meals: MealEntry[];
  settings: UserSettings;
  loading: boolean;
  todayMeals: MealEntry[];
  todayTotal: number;
  weeklyData: DayData[];
  weekAverage: number;
  daysTrackedThisWeek: number;
  streak: number;
  addMeal: (meal: MealEntry) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  refreshMeals: () => Promise<void>;
}

const MealsContext = createContext<MealsContextValue | null>(null);

const DEFAULT_SETTINGS: UserSettings = { dailyGoal: 2000 };

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [loadedMeals, loadedSettings] = await Promise.all([
        storage.list<MealEntry>('meals:'),
        storage.get<UserSettings>('settings'),
      ]);
      // Sort meals newest first
      loadedMeals.sort((a, b) => b.timestamp - a.timestamp);
      setMeals(loadedMeals);
      if (loadedSettings) setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addMeal = useCallback(async (meal: MealEntry) => {
    await storage.set(`meals:${meal.id}`, meal);
    setMeals((prev) => [meal, ...prev]);
  }, []);

  const removeMeal = useCallback(async (id: string) => {
    await storage.remove(`meals:${id}`);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateGoal = useCallback(async (goal: number) => {
    const newSettings = { ...settings, dailyGoal: goal };
    await storage.set('settings', newSettings);
    setSettings(newSettings);
  }, [settings]);

  const refreshMeals = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, [loadData]);

  const todayMeals = useMemo(() => meals.filter((m) => isToday(m.timestamp)), [meals]);

  const todayTotal = useMemo(() => todayMeals.reduce((sum, m) => sum + m.calories, 0), [todayMeals]);

  const weeklyData = useMemo(() => getLast7DaysData(meals), [meals]);

  const weekAverage = useMemo(() => {
    const daysWithData = weeklyData.filter((d) => d.total > 0);
    if (daysWithData.length === 0) return 0;
    return Math.round(daysWithData.reduce((sum, d) => sum + d.total, 0) / daysWithData.length);
  }, [weeklyData]);

  const daysTrackedThisWeek = useMemo(() => weeklyData.filter((d) => d.total > 0).length, [weeklyData]);

  const streak = useMemo(() => calculateStreak(meals), [meals]);

  const value = useMemo<MealsContextValue>(
    () => ({
      meals,
      settings,
      loading,
      todayMeals,
      todayTotal,
      weeklyData,
      weekAverage,
      daysTrackedThisWeek,
      streak,
      addMeal,
      removeMeal,
      updateGoal,
      refreshMeals,
    }),
    [
      meals,
      settings,
      loading,
      todayMeals,
      todayTotal,
      weeklyData,
      weekAverage,
      daysTrackedThisWeek,
      streak,
      addMeal,
      removeMeal,
      updateGoal,
      refreshMeals,
    ]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals(): MealsContextValue {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error('useMeals must be used within MealsProvider');
  return ctx;
}
