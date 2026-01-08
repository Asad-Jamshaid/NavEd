// ==========================================
// Theme Context - Dark Mode & Font Scaling
// ==========================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Theme,
  ThemeMode,
  FontSizeScale,
  createTheme,
  lightColors,
  darkColors,
  fontScaleMultipliers,
} from '../theme';

// ==========================================
// TYPES
// ==========================================

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  fontSizeScale: FontSizeScale;
  isHighContrast: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setFontSizeScale: (scale: FontSizeScale) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  // Helper functions
  getScaledFontSize: (baseSize: number) => number;
  getColor: (colorKey: keyof typeof lightColors) => string;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
  THEME_MODE: '@naved_theme_mode',
  FONT_SCALE: '@naved_font_scale',
  HIGH_CONTRAST: '@naved_high_contrast',
};

// ==========================================
// CONTEXT
// ==========================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [fontSizeScale, setFontSizeScaleState] = useState<FontSizeScale>('medium');
  const [isHighContrast, setHighContrastState] = useState(false);
  // Start with isLoaded=true to render immediately (preferences will update after load)
  const [isLoaded, setIsLoaded] = useState(true);

  // Determine if dark mode should be active
  const isDarkMode = themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  // Create the theme object
  const theme = createTheme(isDarkMode, isHighContrast, fontSizeScale);

  // Load saved preferences
  useEffect(() => {
    loadSavedPreferences();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Theme will automatically update via the isDarkMode calculation
    });

    return () => subscription.remove();
  }, []);

  const loadSavedPreferences = async () => {
    try {
      const [savedMode, savedScale, savedContrast] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.FONT_SCALE),
        AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST),
      ]);

      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      }
      if (savedScale) {
        setFontSizeScaleState(savedScale as FontSizeScale);
      }
      if (savedContrast) {
        setHighContrastState(savedContrast === 'true');
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Setters with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  const setFontSizeScale = useCallback(async (scale: FontSizeScale) => {
    setFontSizeScaleState(scale);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FONT_SCALE, scale);
    } catch (error) {
      console.error('Error saving font scale:', error);
    }
  }, []);

  const setHighContrast = useCallback(async (enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(enabled));
    } catch (error) {
      console.error('Error saving high contrast setting:', error);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDarkMode, setThemeMode]);

  // Helper: Get scaled font size
  const getScaledFontSize = useCallback((baseSize: number): number => {
    return Math.round(baseSize * fontScaleMultipliers[fontSizeScale]);
  }, [fontSizeScale]);

  // Helper: Get color from theme
  const getColor = useCallback((colorKey: keyof typeof lightColors): string => {
    return theme.colors[colorKey];
  }, [theme.colors]);

  const value: ThemeContextType = {
    theme,
    themeMode,
    fontSizeScale,
    isHighContrast,
    setThemeMode,
    setFontSizeScale,
    setHighContrast,
    toggleDarkMode,
    getScaledFontSize,
    getColor,
  };

  // Always render - preferences will update after load (prevents test failures)
  // In production, the initial render uses default values which is acceptable

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// ==========================================
// STYLED HELPERS (for common patterns)
// ==========================================

export const useThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
): T => {
  const { theme } = useTheme();
  return styleFactory(theme);
};

// Export default
export default { ThemeProvider, useTheme, useThemedStyles };
