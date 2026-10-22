export const Colors = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#8A8A8A',
  accent: '#6B9E7A',
  accentLight: '#E8F0EA',
  accentDark: '#567E63',
  danger: '#D4654A',
  dangerLight: '#FCEAE5',
  border: '#F0EDE8',
  overlay: 'rgba(0,0,0,0.4)',
  confidenceLow: '#E8913A',
  confidenceMedium: '#D4B94A',
  confidenceHigh: '#6B9E7A',
} as const;

export const Fonts = {
  displayBold: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
