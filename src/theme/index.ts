// ==========================================
// NavEd Modern Design System
// Modern Minimal Style - Clean, Whitespace, Soft Shadows
// ==========================================

import { Platform } from 'react-native';

// ==========================================
// COLOR PALETTE
// ==========================================

export const lightColors = {
  // Primary
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Secondary
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',

  // Background & Surface
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',

  // Text
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders & Dividers
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Status Colors (Parking)
  available: '#10B981',
  moderate: '#F59E0B',
  full: '#EF4444',
};

export const darkColors = {
  // Primary
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',

  // Secondary
  secondary: '#34D399',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#10B981',

  // Background & Surface
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#1F2937',

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Borders & Dividers
  border: '#374151',
  divider: '#2D2D2D',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Status Colors (Parking)
  available: '#34D399',
  moderate: '#FBBF24',
  full: '#F87171',
};

// High Contrast (Accessibility) - Improved colors for better visibility and comfort
export const highContrastColors = {
  // Backgrounds - Off-white for reduced eye strain
  background: '#F8F8F8',
  surface: '#FFFFFF',
  surfaceVariant: '#EEEEEE',

  // Text - Dark gray instead of pure black
  textPrimary: '#1A1A1A',
  textSecondary: '#404040',
  textTertiary: '#666666',
  textInverse: '#FFFFFF',

  // Primary - Strong blue with good contrast
  primary: '#0052CC',
  primaryLight: '#0065FF',
  primaryDark: '#003D99',

  // Secondary - Strong green
  secondary: '#00875A',
  secondaryLight: '#00A36C',
  secondaryDark: '#006644',

  // Semantic colors
  success: '#00875A',
  warning: '#FF8B00',  // Orange instead of harsh yellow
  error: '#DE350B',
  info: '#0052CC',

  // Borders
  border: '#2D2D2D',
  divider: '#CCCCCC',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Status Colors
  available: '#00875A',
  moderate: '#FF8B00',
  full: '#DE350B',
};

// ==========================================
// TYPOGRAPHY
// ==========================================

export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({ ios: 'System', android: 'Roboto' }),
    medium: Platform.select({ ios: 'System', android: 'Roboto-Medium' }),
    semibold: Platform.select({ ios: 'System', android: 'Roboto-Medium' }),
    bold: Platform.select({ ios: 'System', android: 'Roboto-Bold' }),
  },

  // Font Sizes (Base - will be scaled by user preference)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Pre-defined Text Styles
  heading1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

// ==========================================
// SPACING
// ==========================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// ==========================================
// BORDER RADIUS
// ==========================================

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ==========================================
// SHADOWS
// ==========================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
};

// ==========================================
// ANIMATIONS
// ==========================================

export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,

  // Easing (for react-native-reanimated)
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ==========================================
// COMPONENT SIZES
// ==========================================

export const componentSizes = {
  // Touch targets (accessibility minimum 44x44)
  touchTarget: {
    min: 44,
    preferred: 48,
  },

  // Button heights
  button: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Input heights
  input: {
    sm: 40,
    md: 48,
    lg: 56,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Avatar sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },

  // Tab bar
  tabBar: {
    height: 60,
    iconSize: 24,
  },

  // Header
  header: {
    height: 56,
  },
};

// ==========================================
// Z-INDEX
// ==========================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
};

// ==========================================
// THEME TYPE
// ==========================================

export type ThemeColors = typeof lightColors;
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeScale = 'small' | 'medium' | 'large' | 'xlarge';

export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animation: typeof animation;
  componentSizes: typeof componentSizes;
  zIndex: typeof zIndex;
  isDark: boolean;
  fontScale: number;
}

// Font scale multipliers
export const fontScaleMultipliers: Record<FontSizeScale, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
  xlarge: 1.3,
};

// Create theme helper
export const createTheme = (
  isDark: boolean = false,
  isHighContrast: boolean = false,
  fontScale: FontSizeScale = 'medium'
): Theme => {
  let colors: ThemeColors;

  if (isHighContrast) {
    colors = { ...lightColors, ...highContrastColors } as ThemeColors;
  } else {
    colors = isDark ? darkColors : lightColors;
  }

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    componentSizes,
    zIndex,
    isDark,
    fontScale: fontScaleMultipliers[fontScale],
  };
};

// Default export
export default {
  lightColors,
  darkColors,
  highContrastColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  componentSizes,
  zIndex,
  createTheme,
};
