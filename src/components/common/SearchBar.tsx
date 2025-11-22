// ==========================================
// Accessible Search Bar Component
// ==========================================

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, ACCESSIBILITY_CONFIG } from '../../utils/constants';
import { selectionHaptic } from '../../services/accessibilityService';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  highContrast?: boolean;
}

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  autoFocus = false,
  highContrast = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = async () => {
    await selectionHaptic();
    onChangeText('');
    onClear?.();
  };

  const handleSubmit = async () => {
    await selectionHaptic();
    Keyboard.dismiss();
    onSubmit?.();
  };

  const containerStyle = [
    styles.container,
    isFocused && styles.containerFocused,
    highContrast && styles.containerHighContrast,
  ];

  return (
    <View style={containerStyle}>
      <MaterialIcons
        name="search"
        size={24}
        color={highContrast ? '#FFFFFF' : COLORS.gray}
        style={styles.searchIcon}
      />

      <TextInput
        style={[styles.input, highContrast && styles.inputHighContrast]}
        placeholder={placeholder}
        placeholderTextColor={highContrast ? '#AAAAAA' : COLORS.gray}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessible={true}
        accessibilityRole="search"
        accessibilityLabel="Search input"
        accessibilityHint={`Enter text to ${placeholder.toLowerCase()}`}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clears the search text"
        >
          <MaterialIcons
            name="close"
            size={20}
            color={highContrast ? '#FFFFFF' : COLORS.gray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: ACCESSIBILITY_CONFIG.preferredTouchTarget,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: SPACING.sm,
  },
  inputHighContrast: {
    color: '#FFFFFF',
  },
  clearButton: {
    padding: SPACING.xs,
    minWidth: ACCESSIBILITY_CONFIG.minTouchTarget,
    minHeight: ACCESSIBILITY_CONFIG.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
