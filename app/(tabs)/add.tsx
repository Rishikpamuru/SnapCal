import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useMeals } from '@/context/MealsContext';
import { analyzeMeal, lastApiError } from '@/lib/api';
import { Colors, Fonts, FontSizes, Radius, Shadows, Spacing } from '@/lib/theme';
import type { MealAnalysis, MealEntry } from '@/lib/types';
import { generateId } from '@/lib/utils';

type Phase = 'capture' | 'analyzing' | 'result' | 'error' | 'saved';

export default function AddMealScreen() {
  const insets = useSafeAreaInsets();
  const { addMeal } = useMeals();

  const [phase, setPhase] = useState<Phase>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [manualCalories, setManualCalories] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const pickImage = async (useCamera: boolean) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      // Friendly permission message handled by the UI
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.3,
          allowsEditing: false,
          base64: false,
          exif: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.3,
          allowsEditing: false,
          base64: false,
          mediaTypes: ['images'],
          exif: false,
        });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setPhase('analyzing');

    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'base64',
      });
      setImageBase64(base64);

      // Analyze with Claude Vision
      const analysisResult = await analyzeMeal(base64);

      if (analysisResult) {
        setAnalysis(analysisResult);
        setPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-save after 3 seconds
        autoSaveTimer.current = setTimeout(() => {
          saveMeal(base64, analysisResult);
        }, 3000);
      } else {
        setPhase('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setPhase('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const saveMeal = async (base64: string, data: MealAnalysis) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    const meal: MealEntry = {
      id: generateId(),
      timestamp: Date.now(),
      photo_base64: base64,
      calories: data.calories,
      meal_name: data.meal_name,
      breakdown: data.breakdown,
      confidence: data.confidence,
    };

    await addMeal(meal);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('saved');

    // Navigate back to Today after a brief moment
    setTimeout(() => {
      resetState();
      router.push('/(tabs)/');
    }, 1200);
  };

  const saveManualEntry = async () => {
    const cal = parseInt(manualCalories, 10);
    if (isNaN(cal) || cal <= 0) return;

    const meal: MealEntry = {
      id: generateId(),
      timestamp: Date.now(),
      photo_base64: imageBase64 || '',
      calories: cal,
      meal_name: 'Manual entry',
      breakdown: 'Manually entered calories',
      confidence: 'low',
    };

    await addMeal(meal);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('saved');

    setTimeout(() => {
      resetState();
      router.push('/(tabs)/');
    }, 1200);
  };

  const resetState = () => {
    setPhase('capture');
    setImageUri(null);
    setImageBase64(null);
    setAnalysis(null);
    setManualCalories('');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
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
        <View style={styles.header}>
          <Text style={styles.title}>Add Meal</Text>
          {phase !== 'capture' && phase !== 'saved' && (
            <Pressable onPress={resetState}>
              <Text style={styles.resetText}>Start over</Text>
            </Pressable>
          )}
        </View>

        {/* Image Preview */}
        {imageUri && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.previewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
          </Animated.View>
        )}

        {/* CAPTURE PHASE */}
        {phase === 'capture' && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.captureSection}>
            <Pressable
              style={styles.cameraButton}
              onPress={() => pickImage(true)}
            >
              <Text style={styles.cameraEmoji}>📷</Text>
              <Text style={styles.cameraText}>Take a Photo</Text>
              <Text style={styles.cameraSubtext}>Snap your meal for instant calorie estimate</Text>
            </Pressable>

            <Pressable
              style={styles.galleryButton}
              onPress={() => pickImage(false)}
            >
              <Text style={styles.galleryText}>Choose from Gallery</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ANALYZING PHASE */}
        {phase === 'analyzing' && (
          <Animated.View entering={FadeIn.duration(300)}>
            <LoadingOverlay />
          </Animated.View>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && analysis && (
          <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.resultSection}>
            <Text style={styles.caloriesLarge}>{analysis.calories}</Text>
            <Text style={styles.calLabel}>estimated calories</Text>

            <Text style={styles.mealNameResult}>{analysis.meal_name}</Text>
            <ConfidenceBadge confidence={analysis.confidence} />

            <Text style={styles.breakdownText}>{analysis.breakdown}</Text>

            <View style={styles.resultButtons}>
              <Button
                title="Save Now"
                onPress={() => saveMeal(imageBase64!, analysis)}
                size="lg"
                fullWidth
              />
              <Text style={styles.autoSaveHint}>Auto-saving in a moment...</Text>
            </View>
          </Animated.View>
        )}

        {/* ERROR PHASE */}
        {phase === 'error' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.errorSection}>
            <Text style={styles.errorEmoji}>🤔</Text>
            <Text style={styles.errorText}>Couldn&apos;t analyze that photo</Text>
            <Text style={styles.errorSubtext}>Try a clearer shot, or enter calories manually</Text>
            {lastApiError ? (
              <Text style={styles.debugText}>{lastApiError}</Text>
            ) : null}

            <View style={styles.manualEntry}>
              <TextInput
                style={styles.manualInput}
                placeholder="Enter calories"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="number-pad"
                value={manualCalories}
                onChangeText={setManualCalories}
                returnKeyType="done"
              />
              <Button
                title="Save"
                onPress={saveManualEntry}
                disabled={!manualCalories || parseInt(manualCalories, 10) <= 0}
              />
            </View>

            <Button
              title="Try Another Photo"
              onPress={resetState}
              variant="secondary"
              fullWidth
            />
          </Animated.View>
        )}

        {/* SAVED PHASE */}
        {phase === 'saved' && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.savedSection}>
            <Text style={styles.savedEmoji}>✅</Text>
            <Text style={styles.savedText}>Meal logged!</Text>
          </Animated.View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['2xl'],
    color: Colors.text,
  },
  resetText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.accent,
  },
  previewWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: Radius.xl,
    backgroundColor: Colors.border,
  },
  captureSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  cameraButton: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing['2xl'],
    alignItems: 'center',
    width: '100%',
    ...Shadows.card,
  },
  cameraEmoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  cameraText: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
  },
  cameraSubtext: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  galleryButton: {
    marginTop: Spacing.base,
    paddingVertical: Spacing.md,
  },
  galleryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.base,
    color: Colors.accent,
  },
  resultSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  caloriesLarge: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['4xl'],
    color: Colors.text,
    lineHeight: FontSizes['4xl'] * 1.1,
  },
  calLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  mealNameResult: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  breakdownText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  resultButtons: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  autoSaveHint: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  errorSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.text,
  },
  errorSubtext: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  debugText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: Colors.danger,
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
  },
  manualEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    marginVertical: Spacing.base,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  savedSection: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  savedEmoji: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  savedText: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.accent,
  },
});
