import { Colors, Fonts, FontSizes, Shadows } from '@/lib/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function TodayIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.71-13h1.42v5.36l3.54 2.12-.71 1.18-4.25-2.56V7z"
        fill={color}
      />
    </Svg>
  );
}

function AddIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.addIconWrapper, focused && styles.addIconFocused]}>
      <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={focused ? '#FFF' : color} />
      </Svg>
    </View>
  );
}

function HistoryIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3v8h.01L3 11.01 9 17l2-2-4-4h7c2.76 0 5-2.24 5-5s-2.24-5-5-5H3zm11 8H9.83L12 8.83 14 11zM3 13h2v8H3v-8zm4 0h2v8H7v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8z"
        fill={color}
      />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TodayIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => <AddIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <HistoryIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    ...Shadows.card,
  },
  tabBarLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  tabBarItem: {
    gap: 4,
  },
  addIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },
  addIconFocused: {
    backgroundColor: Colors.accent,
    ...Shadows.button,
  },
});
