// ==========================================
// Accessible Button Component
// Meets WCAG 2.1 AA standards
// ==========================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, ACCESSIBILITY_CONFIG } from '../../utils/constants';
import { triggerHaptic, selectionHaptic } from '../../services/accessibilityService';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  highContrast?: boolean;
}

export default function AccessibleButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityHint,
  style,
  textStyle,
  highContrast = false,
}: AccessibleButtonProps) {
  const handlePress = async () => {
    if (disabled || loading) return;
    await selectionHaptic();
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...getSizeStyle(),
      ...(fullWidth && styles.fullWidth),
    };

    if (disabled) {
      return { ...baseStyle, ...styles.disabled };
    }

    if (highContrast) {
      return { ...baseStyle, ...styles.highContrast };
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primary };
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'outline':
        return { ...baseStyle, ...styles.outline };
      case 'text':
        return { ...baseStyle, ...styles.text };
      case 'danger':
        return { ...baseStyle, ...styles.danger };
      default:
        return { ...baseStyle, ...styles.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.baseText,
      ...getTextSizeStyle(),
    };

    if (disabled) {
      return { ...baseTextStyle, ...styles.disabledText };
    }

    if (highContrast) {
      return { ...baseTextStyle, color: '#000000' };
    }

    switch (variant) {
      case 'primary':
      case 'danger':
        return { ...baseTextStyle, color: COLORS.white };
      case 'secondary':
        return { ...baseTextStyle, color: COLORS.white };
      case 'outline':
      case 'text':
        return { ...baseTextStyle, color: COLORS.primary };
      default:
        return baseTextStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const iconColor = disabled
    ? COLORS.gray
    : highContrast
    ? '#000000'
    : variant === 'outline' || variant === 'text'
    ? COLORS.primary
    : COLORS.white;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={getIconSize()}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={getIconSize()}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    // Minimum touch target for accessibility
    minWidth: ACCESSIBILITY_CONFIG.minTouchTarget,
    minHeight: ACCESSIBILITY_CONFIG.minTouchTarget,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.grayLight,
  },
  highContrast: {
    backgroundColor: '#FFFF00',
    borderWidth: 2,
    borderColor: '#000000',
  },

  // Sizes
  sizeSmall: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  sizeMedium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sizeLarge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  // Text
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  disabledText: {
    color: COLORS.gray,
  },

  // Icons
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
});
