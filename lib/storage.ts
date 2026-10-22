import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async set(key: string, data: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },

  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  },

  async list<T>(prefix: string): Promise<T[]> {
    const allKeys = await AsyncStorage.getAllKeys();
    const matchingKeys = allKeys.filter((k) => k.startsWith(prefix));
    if (matchingKeys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(matchingKeys);
    return pairs
      .map(([, value]) => {
        if (value === null) return null;
        return JSON.parse(value) as T;
      })
      .filter((v): v is T => v !== null);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
