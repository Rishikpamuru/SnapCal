export interface MealEntry {
  id: string;
  timestamp: number;
  photo_base64: string;
  calories: number;
  meal_name: string;
  breakdown: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface UserSettings {
  dailyGoal: number;
}

export interface MealAnalysis {
  calories: number;
  meal_name: string;
  confidence: 'low' | 'medium' | 'high';
  breakdown: string;
}

export interface DayData {
  date: string;
  dayLabel: string;
  total: number;
}
