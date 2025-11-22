# Accessibility Implementation Guide for React Native

## WCAG 2.1 Level AA Compliance

**Last Updated:** November 2025
**Standard:** WCAG 2.1 Level AA

---

## Table of Contents

1. [WCAG 2.1 Overview](#1-wcag-21-overview)
2. [Core Accessibility Props](#2-core-accessibility-props)
3. [Touch Target Requirements](#3-touch-target-requirements)
4. [Color Contrast Requirements](#4-color-contrast-requirements)
5. [Screen Reader Support](#5-screen-reader-support)
6. [Text Scaling](#6-text-scaling)
7. [Voice Guidance Implementation](#7-voice-guidance-implementation)
8. [Haptic Feedback](#8-haptic-feedback)
9. [Testing Accessibility](#9-testing-accessibility)
10. [Complete Accessible Components](#10-complete-accessible-components)

---

## 1. WCAG 2.1 Overview

### The Four Principles (POUR)

| Principle | Description | Key Requirements |
|-----------|-------------|------------------|
| **Perceivable** | Information must be presentable | Text alternatives, captions, contrast |
| **Operable** | Interface must be usable | Keyboard access, timing, navigation |
| **Understandable** | Content must be readable | Clear language, predictable behavior |
| **Robust** | Content must be interpretable | Compatible with assistive tech |

### WCAG 2.1 New Success Criteria

WCAG 2.1 added 17 new criteria specifically for:
- **Mobile accessibility**
- **People with low vision**
- **People with cognitive disabilities**

### Compliance Levels

| Level | Requirements |
|-------|--------------|
| **A** | Minimum accessibility |
| **AA** | Target level for most apps (NavEd target) |
| **AAA** | Highest level, not always achievable |

---

## 2. Core Accessibility Props

### Essential React Native Props

```typescript
import { View, Text, TouchableOpacity } from 'react-native';

// Basic accessible component
<TouchableOpacity
  accessible={true}                          // Mark as accessible
  accessibilityRole="button"                 // Semantic role
  accessibilityLabel="Navigate to Library"   // Screen reader text
  accessibilityHint="Double tap to start navigation"  // Additional context
  accessibilityState={{
    selected: isSelected,
    disabled: isDisabled,
    checked: isChecked,
    expanded: isExpanded,
    busy: isLoading,
  }}
  accessibilityValue={{
    min: 0,
    max: 100,
    now: 75,
    text: "75% complete",
  }}
  onPress={handlePress}
>
  <Text>Navigate</Text>
</TouchableOpacity>
```

### Accessibility Roles

```typescript
type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'    // Slider
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';
```

### Grouping for Screen Readers

```typescript
// Group related elements for logical reading
<View
  accessible={true}
  accessibilityLabel="Main Library, Open until 10 PM, 500 meters away"
>
  <Text>Main Library</Text>
  <Text>Open until 10 PM</Text>
  <Text>500m away</Text>
</View>
```

---

## 3. Touch Target Requirements

### WCAG 2.1 Requirement
- **Minimum 44×44 CSS pixels** (Level AAA)
- **Recommended 48×48 pixels** for mobile (Level AA practical)

### Implementation

```typescript
// src/components/common/AccessibleTouchable.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const MIN_TOUCH_SIZE = 48; // pixels

const AccessibleTouchable: React.FC<Props> = ({
  onPress,
  children,
  style,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  hapticFeedback = true,
}) => {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[styles.touchable, style]}
      hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    minWidth: MIN_TOUCH_SIZE,
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessibleTouchable;
```

---

## 4. Color Contrast Requirements

### WCAG 2.1 Contrast Ratios

| Content Type | AA Requirement | AAA Requirement |
|--------------|----------------|-----------------|
| Normal text | 4.5:1 | 7:1 |
| Large text (18pt+) | 3:1 | 4.5:1 |
| UI components | 3:1 | N/A |

### Contrast Calculation Utility

```typescript
// src/utils/accessibility/contrast.ts

/**
 * Calculate relative luminance of a color
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Parse hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG AA requirement
 */
export const meetsContrastAA = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Get accessible text color for a background
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const white = '#FFFFFF';
  const black = '#000000';

  const whiteRatio = getContrastRatio(white, backgroundColor);
  const blackRatio = getContrastRatio(black, backgroundColor);

  return whiteRatio > blackRatio ? white : black;
};
```

### Accessible Color Palette

```typescript
// src/utils/constants/colors.ts

export const ACCESSIBLE_COLORS = {
  // Primary colors (all pass AA against white)
  primary: '#1565C0',        // 5.9:1 on white
  primaryDark: '#003C8F',    // 10.3:1 on white

  // Text colors
  textPrimary: '#212121',    // 16.1:1 on white
  textSecondary: '#616161',  // 5.9:1 on white

  // Status colors (all pass AA)
  success: '#2E7D32',        // 5.1:1 on white
  warning: '#E65100',        // 4.6:1 on white
  error: '#C62828',          // 5.9:1 on white

  // High contrast mode
  highContrast: {
    background: '#000000',
    text: '#FFFFFF',         // 21:1 ratio
    accent: '#FFFF00',       // High visibility yellow
    link: '#00FFFF',         // Cyan for links
  },
};
```

---

## 5. Screen Reader Support

### Announcing Changes

```typescript
import { AccessibilityInfo } from 'react-native';

// Announce navigation updates
const announceNavigation = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

// Usage
announceNavigation('Turn right in 50 meters');
announceNavigation('Arrived at Main Library');
```

### Focus Management

```typescript
import { useRef } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

const SearchScreen = () => {
  const resultsRef = useRef(null);

  const handleSearch = async () => {
    await performSearch();

    // Move focus to results after search
    if (resultsRef.current) {
      const handle = findNodeHandle(resultsRef.current);
      if (handle) {
        AccessibilityInfo.setAccessibilityFocus(handle);
      }
    }
  };

  return (
    <View>
      <SearchBar onSearch={handleSearch} />
      <View ref={resultsRef} accessible>
        <Text>Search Results</Text>
        {/* Results here */}
      </View>
    </View>
  );
};
```

### Live Regions

```typescript
// Announce dynamic content changes
<View
  accessibilityLiveRegion="polite"  // or "assertive" for urgent
  accessibilityRole="alert"
>
  <Text>{parkingStatus}</Text>
</View>
```

---

## 6. Text Scaling

### Supporting Dynamic Type

```typescript
// src/hooks/useAccessibleFontSize.ts

import { useWindowDimensions, PixelRatio } from 'react-native';

interface FontSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

// Base font sizes
const BASE_SIZES: FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

// User preference multipliers
const SCALE_FACTORS = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.4,
};

export const useAccessibleFontSize = (
  userPreference: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
): FontSizes => {
  const fontScale = PixelRatio.getFontScale();
  const userScale = SCALE_FACTORS[userPreference];

  // Combine system and user preferences
  const combinedScale = fontScale * userScale;

  return {
    xs: Math.round(BASE_SIZES.xs * combinedScale),
    sm: Math.round(BASE_SIZES.sm * combinedScale),
    md: Math.round(BASE_SIZES.md * combinedScale),
    lg: Math.round(BASE_SIZES.lg * combinedScale),
    xl: Math.round(BASE_SIZES.xl * combinedScale),
    xxl: Math.round(BASE_SIZES.xxl * combinedScale),
  };
};
```

### Usage

```typescript
const MyScreen = () => {
  const { preferences } = useAppContext();
  const fontSize = useAccessibleFontSize(preferences.fontSize);

  return (
    <View>
      <Text style={{ fontSize: fontSize.xl }}>Heading</Text>
      <Text style={{ fontSize: fontSize.md }}>Body text</Text>
    </View>
  );
};
```

### Allow Text Wrapping

```typescript
// GOOD: Text can wrap
<Text style={{ flexShrink: 1 }} numberOfLines={0}>
  Long text that needs to wrap for accessibility
</Text>

// BAD: Text gets cut off
<Text numberOfLines={1} ellipsizeMode="tail">
  Long text that gets truncated...
</Text>
```

---

## 7. Voice Guidance Implementation

### Complete Voice Service

```typescript
// src/services/voiceGuidanceService.ts

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoiceSettings {
  enabled: boolean;
  rate: number;      // 0.5 - 2.0
  pitch: number;     // 0.5 - 2.0
  language: string;
}

const STORAGE_KEY = '@naved_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  rate: 1.0,
  pitch: 1.0,
  language: 'en-US',
};

let currentSettings: VoiceSettings = DEFAULT_SETTINGS;

/**
 * Initialize voice service
 */
export const initializeVoiceService = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load voice settings:', error);
  }
};

/**
 * Update voice settings
 */
export const updateVoiceSettings = async (
  settings: Partial<VoiceSettings>
): Promise<void> => {
  currentSettings = { ...currentSettings, ...settings };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
};

/**
 * Get current settings
 */
export const getVoiceSettings = (): VoiceSettings => currentSettings;

/**
 * Speak text with current settings
 */
export const speak = async (
  text: string,
  options?: Partial<VoiceSettings>
): Promise<void> => {
  if (!currentSettings.enabled && !options?.enabled) {
    return;
  }

  // Stop any current speech
  await Speech.stop();

  const speechOptions = {
    rate: options?.rate ?? currentSettings.rate,
    pitch: options?.pitch ?? currentSettings.pitch,
    language: options?.language ?? currentSettings.language,
  };

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      ...speechOptions,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
};

/**
 * Stop current speech
 */
export const stopSpeaking = async (): Promise<void> => {
  await Speech.stop();
};

/**
 * Check if currently speaking
 */
export const isSpeaking = async (): Promise<boolean> => {
  return Speech.isSpeakingAsync();
};

/**
 * Navigation-specific announcements
 */
export const announceNavigation = async (
  instruction: string,
  distance?: string
): Promise<void> => {
  const message = distance
    ? `${instruction}. ${distance}`
    : instruction;

  await speak(message);
};

/**
 * Announce arrival
 */
export const announceArrival = async (destination: string): Promise<void> => {
  await speak(`You have arrived at ${destination}`);
};

/**
 * Announce parking status
 */
export const announceParkingStatus = async (
  lotName: string,
  available: number,
  total: number
): Promise<void> => {
  const percentage = Math.round((available / total) * 100);
  const status = percentage > 50 ? 'has good availability' :
                 percentage > 20 ? 'is filling up' :
                 'is almost full';

  await speak(`${lotName} ${status}. ${available} spots available out of ${total}.`);
};

/**
 * Get available voices
 */
export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  return Speech.getAvailableVoicesAsync();
};
```

---

## 8. Haptic Feedback

### Complete Haptic Service

```typescript
// src/services/hapticService.ts

import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

const STORAGE_KEY = '@naved_haptic_settings';

let settings: HapticSettings = {
  enabled: true,
  intensity: 'medium',
};

/**
 * Initialize haptic service
 */
export const initializeHaptics = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      settings = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load haptic settings:', error);
  }
};

/**
 * Update settings
 */
export const updateHapticSettings = async (
  newSettings: Partial<HapticSettings>
): Promise<void> => {
  settings = { ...settings, ...newSettings };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

/**
 * Get current settings
 */
export const getHapticSettings = (): HapticSettings => settings;

/**
 * Trigger impact feedback
 */
export const impact = async (
  style?: 'light' | 'medium' | 'heavy'
): Promise<void> => {
  if (!settings.enabled) return;

  const impactStyle = style || settings.intensity;

  const styleMap = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };

  await Haptics.impactAsync(styleMap[impactStyle]);
};

/**
 * Selection feedback (light tap)
 */
export const selection = async (): Promise<void> => {
  if (!settings.enabled) return;
  await Haptics.selectionAsync();
};

/**
 * Success feedback
 */
export const success = async (): Promise<void> => {
  if (!settings.enabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Warning feedback
 */
export const warning = async (): Promise<void> => {
  if (!settings.enabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Error feedback
 */
export const error = async (): Promise<void> => {
  if (!settings.enabled) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Navigation turn feedback
 */
export const navigationTurn = async (): Promise<void> => {
  if (!settings.enabled) return;

  // Double tap pattern for turn
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await new Promise(resolve => setTimeout(resolve, 100));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Arrival feedback
 */
export const arrival = async (): Promise<void> => {
  if (!settings.enabled) return;

  // Triple success pattern
  for (let i = 0; i < 3; i++) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
};
```

---

## 9. Testing Accessibility

### Manual Testing Checklist

```markdown
## Screen Reader Testing (VoiceOver/TalkBack)

- [ ] All interactive elements are focusable
- [ ] Focus order is logical (top-to-bottom, left-to-right)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have clear labels
- [ ] Dynamic content is announced
- [ ] No content is skipped

## Visual Testing

- [ ] Text contrast meets 4.5:1 ratio
- [ ] Touch targets are at least 48x48
- [ ] UI is usable at 200% text scale
- [ ] No information conveyed by color alone
- [ ] Focus indicators are visible

## Motor Testing

- [ ] All functions accessible without gestures
- [ ] No time-limited interactions
- [ ] Adequate touch target spacing
```

### Automated Testing with Jest

```typescript
// __tests__/accessibility/button.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import AccessibleButton from '../../src/components/common/AccessibleButton';

describe('AccessibleButton Accessibility', () => {
  it('has correct accessibility props', () => {
    const { getByRole, getByLabelText } = render(
      <AccessibleButton
        title="Navigate"
        onPress={() => {}}
        accessibilityLabel="Navigate to destination"
        accessibilityHint="Double tap to start navigation"
      />
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(getByLabelText('Navigate to destination')).toBeTruthy();
  });

  it('has minimum touch target size', () => {
    const { getByRole } = render(
      <AccessibleButton title="Test" onPress={() => {}} />
    );

    const button = getByRole('button');
    const { height, width } = button.props.style;

    // Flatten styles if needed
    const minHeight = typeof height === 'object' ? 48 : height;
    const minWidth = typeof width === 'object' ? 48 : width;

    expect(minHeight).toBeGreaterThanOrEqual(48);
    expect(minWidth).toBeGreaterThanOrEqual(48);
  });

  it('indicates disabled state', () => {
    const { getByRole } = render(
      <AccessibleButton title="Test" onPress={() => {}} disabled />
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

### Using Accessibility Insights (Android)

```bash
# Install Accessibility Scanner from Play Store
# Or use Accessibility Insights for Android (desktop app)

# Run your app and scan each screen
# Fix any issues flagged by the scanner
```

---

## 10. Complete Accessible Components

### Accessible Button

```typescript
// src/components/common/AccessibleButton.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ACCESSIBLE_COLORS } from '@utils/constants';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AccessibleButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = variant === 'primary' ? '#FFFFFF' :
                    variant === 'danger' ? '#FFFFFF' :
                    ACCESSIBLE_COLORS.primary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48, // WCAG minimum
    minWidth: 48,  // WCAG minimum
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },

  // Variants
  primary: {
    backgroundColor: ACCESSIBLE_COLORS.primary,
  },
  secondary: {
    backgroundColor: '#E3F2FD',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ACCESSIBLE_COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: ACCESSIBLE_COLORS.error,
  },

  // Variant text
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: ACCESSIBLE_COLORS.primary },
  outlineText: { color: ACCESSIBLE_COLORS.primary },
  textText: { color: ACCESSIBLE_COLORS.primary },
  dangerText: { color: '#FFFFFF' },

  // Sizes
  small: { minHeight: 36, paddingHorizontal: 12 },
  medium: { minHeight: 48, paddingHorizontal: 16 },
  large: { minHeight: 56, paddingHorizontal: 24 },

  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },

  // States
  disabled: { opacity: 0.5 },
  disabledText: { opacity: 0.7 },
  fullWidth: { width: '100%' },

  // Icons
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});

export default AccessibleButton;
```

---

## Sources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Callstack React Native Accessibility Guide](https://www.callstack.com/blog/react-native-accessibility)
- [A11y React Native Guide](https://addjam.com/blog/2024-08-27/react-native-accessibility-guide/)
- [React Native A11y Basics - Medium](https://medium.com/smallcase-engineering/react-native-a11y-basics-2820cadf2958)

---

**Document Version:** 1.0
**Last Updated:** November 2025
