import type { DayData, MealEntry } from './types';

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isToday(timestamp: number): boolean {
  const start = getStartOfDay();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

export function isSameDay(ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getLast7DaysData(meals: MealEntry[]): DayData[] {
  const days: DayData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = DAY_LABELS[date.getDay()];
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const total = meals
      .filter((m) => m.timestamp >= date.getTime() && m.timestamp < nextDay.getTime())
      .reduce((sum, m) => sum + m.calories, 0);

    days.push({ date: dateStr, dayLabel, total });
  }

  return days;
}

export function calculateStreak(meals: MealEntry[]): number {
  if (meals.length === 0) return 0;

  let streak = 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check if today has meals - if so start counting from today, otherwise from yesterday
  const todayMeals = meals.filter((m) => {
    const d = new Date(m.timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === now.getTime();
  });

  let checkDate = new Date(now);
  if (todayMeals.length === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const hasMeals = meals.some(
      (m) => m.timestamp >= dayStart.getTime() && m.timestamp < dayEnd.getTime()
    );

    if (hasMeals) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
