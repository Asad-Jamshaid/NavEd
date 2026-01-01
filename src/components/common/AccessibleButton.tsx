// ==========================================
// Accessible Button Component - Modern Design
// WCAG 2.1 AA Compliant
// ==========================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { shadows, borderRadius, spacing, componentSizes } from '../../theme';
import { selectionHaptic } from '../../services/accessibilityService';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
}: AccessibleButtonProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    if (disabled || loading) return;
    try {
      await selectionHaptic();
    } catch (e) {
      // Haptic not available
    }
    onPress();
  };

  // Get button colors based on variant
  const getColors = () => {
    if (disabled) {
      return {
        bg: theme.colors.surfaceVariant,
        text: theme.colors.textTertiary,
        border: 'transparent',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.colors.primary,
          border: theme.colors.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: theme.colors.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: theme.colors.error,
          text: '#FFFFFF',
          border: 'transparent',
        };
      default:
        return {
          bg: theme.colors.primary,
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  // Get size styles
  const getSizeStyles = (): { button: ViewStyle; text: TextStyle; icon: number } => {
    switch (size) {
      case 'small':
        return {
          button: {
            height: componentSizes.button.sm,
            paddingHorizontal: spacing.md,
          },
          text: { fontSize: 14 },
          icon: 16,
        };
      case 'large':
        return {
          button: {
            height: componentSizes.button.lg,
            paddingHorizontal: spacing.xl,
          },
          text: { fontSize: 18 },
          icon: 24,
        };
      default:
        return {
          button: {
            height: componentSizes.button.md,
            paddingHorizontal: spacing.lg,
          },
          text: { fontSize: 16 },
          icon: 20,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();

  const buttonStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles.button,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: variant === 'outline' ? 2 : 0,
    ...(fullWidth && styles.fullWidth),
    ...(variant === 'primary' && !disabled && shadows.sm),
  };

  const textStyles: TextStyle = {
    ...styles.text,
    ...sizeStyles.text,
    color: colors.text,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
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
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={sizeStyles.icon}
              color={colors.text}
              style={styles.iconLeft}
            />
          )}
          <Text style={[textStyles, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={sizeStyles.icon}
              color={colors.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Icon-only button variant
export function IconButton({
  icon,
  onPress,
  size = 'medium',
  variant = 'ghost',
  disabled = false,
  accessibilityLabel,
  style,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small': return { button: 36, icon: 20 };
      case 'large': return { button: 52, icon: 28 };
      default: return { button: 44, icon: 24 };
    }
  };

  const getColors = () => {
    if (disabled) {
      return { bg: 'transparent', icon: theme.colors.textTertiary };
    }
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, icon: '#FFFFFF' };
      case 'danger':
        return { bg: theme.colors.error, icon: '#FFFFFF' };
      default:
        return { bg: 'transparent', icon: theme.colors.textPrimary };
    }
  };

  const sizeConfig = getSize();
  const colors = getColors();

  return (
    <TouchableOpacity
      style={[
        {
          width: sizeConfig.button,
          height: sizeConfig.button,
          borderRadius: sizeConfig.button / 2,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialIcons name={icon} size={sizeConfig.icon} color={colors.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minWidth: componentSizes.touchTarget.min,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});
