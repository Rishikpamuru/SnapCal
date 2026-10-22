import type { MealAnalysis } from './types';

export let lastApiError = '';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `You are a food calorie estimation assistant. Analyze meal photos and return ONLY a JSON object with no additional text: {"calories": number, "meal_name": "string", "confidence": "low"|"medium"|"high", "breakdown": "string"}. Estimate total calories. Be concise in meal_name (max 3-4 words). In breakdown, briefly list main items spotted and their approximate individual calories.`;

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');
  }
  return key;
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  return cleaned;
}

export async function analyzeMeal(base64Image: string): Promise<MealAnalysis | null> {
  try {
    const apiKey = getApiKey();

    // Detect media type from base64 header or default to jpeg
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg';
    if (base64Image.startsWith('/9j/')) mediaType = 'image/jpeg';
    else if (base64Image.startsWith('iVBOR')) mediaType = 'image/png';
    else if (base64Image.startsWith('UklGR')) mediaType = 'image/webp';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Analyze this meal photo and estimate calories.',
              },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      lastApiError = `HTTP ${response.status}: ${errText}`;
      console.error('API error:', lastApiError);
      return null;
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text;
    if (!rawText) return null;

    const cleaned = stripMarkdownFences(rawText);
    const parsed = JSON.parse(cleaned) as MealAnalysis;

    // Validate expected fields
    if (
      typeof parsed.calories !== 'number' ||
      typeof parsed.meal_name !== 'string' ||
      typeof parsed.breakdown !== 'string' ||
      !['low', 'medium', 'high'].includes(parsed.confidence)
    ) {
      console.error('Invalid API response shape:', parsed);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error('analyzeMeal error:', err);
    return null;
  }
}
