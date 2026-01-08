// ==========================================
// SearchBar Component - Modern Minimal Design
// ==========================================

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { selectionHaptic } from '../../services/accessibilityService';

// ==========================================
// TYPES
// ==========================================

type SearchBarVariant = 'default' | 'floating' | 'minimal';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  variant?: SearchBarVariant;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  // Voice search support
  showVoiceButton?: boolean;
  onVoicePress?: () => void;
  // Loading state
  isLoading?: boolean;
  // Disabled state
  disabled?: boolean;
  // Right element (for filters, etc.)
  rightElement?: React.ReactNode;
}

// ==========================================
// SEARCHBAR COMPONENT
// ==========================================

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  variant = 'default',
  style,
  inputStyle,
  showVoiceButton = false,
  onVoicePress,
  isLoading = false,
  disabled = false,
  rightElement,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;

  // Focus animation
  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnimation]);

  // Loading spinner animation
  useEffect(() => {
    if (isLoading) {
      const rotation = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotation.start();
      return () => rotation.stop();
    } else {
      loadingRotation.setValue(0);
    }
  }, [isLoading, loadingRotation]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleClear = useCallback(async () => {
    await selectionHaptic();
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const handleSubmit = useCallback(async () => {
    await selectionHaptic();
    Keyboard.dismiss();
    onSubmit?.();
  }, [onSubmit]);

  const handleVoicePress = useCallback(async () => {
    await selectionHaptic();
    onVoicePress?.();
  }, [onVoicePress]);

  // Get variant styles
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      minHeight: 48,
    };

    switch (variant) {
      case 'floating':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.md,
          borderRadius: theme.borderRadius.full,
        };
      case 'minimal':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderBottomWidth: 2,
          borderBottomColor: isFocused ? theme.colors.primary : theme.colors.border,
          borderRadius: 0,
          paddingHorizontal: 0,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: isFocused ? theme.colors.surface : theme.colors.surfaceVariant,
          borderWidth: 2,
          borderColor: isFocused ? theme.colors.primary : 'transparent',
        };
    }
  };

  // Animated border color for default variant
  const animatedBorderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  const animatedBackgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.surface],
  });

  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyles = [
    getContainerStyle(),
    disabled && { opacity: 0.5 },
    style,
  ];

  return (
    <View style={containerStyles}>
      {/* Search icon or loading spinner */}
      {isLoading ? (
        <Animated.View style={{ transform: [{ rotate: spin }], marginRight: theme.spacing.sm }}>
          <MaterialIcons
            name="refresh"
            size={22}
            color={theme.colors.textTertiary}
          />
        </Animated.View>
      ) : (
        <MaterialIcons
          name="search"
          size={22}
          color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
          style={{ marginRight: theme.spacing.sm }}
        />
      )}

      {/* Text input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body.fontSize,
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        editable={!disabled}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessible={true}
        accessibilityRole="search"
        accessibilityLabel="Search input"
        accessibilityHint={`Enter text to ${placeholder.toLowerCase()}`}
        accessibilityState={{ disabled }}
      />

      {/* Right elements */}
      <View style={styles.rightContainer}>
        {/* Clear button */}
        {value.length > 0 && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            style={[
              styles.iconButton,
              { marginRight: rightElement || showVoiceButton ? theme.spacing.xs : 0 },
            ]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Clears the search text"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              style={{
                backgroundColor: theme.colors.textTertiary,
                borderRadius: theme.borderRadius.full,
                padding: 2,
              }}
            >
              <MaterialIcons
                name="close"
                size={14}
                color={theme.colors.surface}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Voice button */}
        {showVoiceButton && onVoicePress && !disabled && (
          <TouchableOpacity
            onPress={handleVoicePress}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            accessibilityHint="Tap to speak your search query"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name="mic"
              size={22}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {/* Custom right element */}
        {rightElement}
      </View>
    </View>
  );
}

// ==========================================
// SEARCH FILTER BAR
// ==========================================

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function FilterChip({ label, selected, onPress, icon }: FilterChipProps) {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePress = async () => {
    await selectionHaptic();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.filterChip,
          {
            backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label} filter`}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={16}
            color={selected ? theme.colors.textInverse : theme.colors.textSecondary}
            style={{ marginRight: 6 }}
          />
        )}
        <Animated.Text
          style={{
            fontSize: theme.typography.bodySmall.fontSize,
            fontWeight: '600',
            color: selected ? theme.colors.textInverse : theme.colors.textSecondary,
          }}
        >
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ==========================================
// SEARCH SUGGESTIONS
// ==========================================

interface SearchSuggestionProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  text: string;
  subtitle?: string;
  onPress: () => void;
  isRecent?: boolean;
}

export function SearchSuggestion({
  icon = 'search',
  text,
  subtitle,
  onPress,
  isRecent = false,
}: SearchSuggestionProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    await selectionHaptic();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.suggestion,
        {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${isRecent ? 'Recent search: ' : ''}${text}`}
    >
      <MaterialIcons
        name={isRecent ? 'history' : icon}
        size={20}
        color={theme.colors.textTertiary}
        style={{ marginRight: theme.spacing.sm }}
      />
      <View style={{ flex: 1 }}>
        <Animated.Text
          style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {text}
        </Animated.Text>
        {subtitle && (
          <Animated.Text
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textTertiary,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>
      <MaterialIcons
        name="north-west"
        size={16}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
