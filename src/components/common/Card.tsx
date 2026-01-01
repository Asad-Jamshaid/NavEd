// ==========================================
// Card Component - Modern Minimal Design
// ==========================================

import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { selectionHaptic } from '../../services/accessibilityService';

// ==========================================
// TYPES
// ==========================================

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  variant?: CardVariant;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  // Header actions (e.g., menu button)
  headerRight?: React.ReactNode;
  // Footer content
  footer?: React.ReactNode;
  // Compact mode for list items
  compact?: boolean;
}

// ==========================================
// CARD COMPONENT
// ==========================================

export default function Card({
  children,
  onPress,
  title,
  subtitle,
  icon,
  iconColor,
  iconBackgroundColor,
  variant = 'elevated',
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  headerRight,
  footer,
  compact = false,
}: CardProps) {
  const { theme } = useTheme();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  // Press animation
  const handlePressIn = useCallback(() => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  }, [disabled, scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [scaleValue]);

  const handlePress = useCallback(async () => {
    if (onPress && !disabled) {
      await selectionHaptic();
      onPress();
    }
  }, [onPress, disabled]);

  // Dynamic styles based on theme and variant
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: compact ? theme.spacing.sm : theme.spacing.md,
      marginVertical: theme.spacing.xs,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background,
        };
      default:
        return baseStyle;
    }
  };

  const cardStyles = [
    getCardStyle(),
    disabled && { opacity: 0.5 },
    style,
  ];

  // Icon container style
  const iconContainerStyle: ViewStyle = {
    width: compact ? 36 : 44,
    height: compact ? 36 : 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: iconBackgroundColor || `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  };

  const content = (
    <>
      {(icon || title || subtitle || headerRight) && (
        <View style={styles.header}>
          {icon && (
            <View style={iconContainerStyle}>
              <MaterialIcons
                name={icon}
                size={compact ? 20 : 24}
                color={iconColor || theme.colors.primary}
              />
            </View>
          )}
          {(title || subtitle) && (
            <View style={styles.titleContainer}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.textPrimary,
                      fontSize: compact ? theme.typography.body.fontSize : theme.typography.heading3.fontSize,
                      fontWeight: theme.typography.heading3.fontWeight as '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.caption.fontSize,
                    },
                  ]}
                  numberOfLines={compact ? 1 : 2}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer && (
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.colors.border },
          ]}
        >
          {footer}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={cardStyles}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          activeOpacity={1}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={cardStyles}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
    >
      {content}
    </View>
  );
}

// ==========================================
// CARD VARIANTS
// ==========================================

// Simple card with just content
export function SimpleCard({
  children,
  style,
  variant = 'elevated',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
}) {
  const { theme } = useTheme();

  const getStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...theme.shadows.md };
      case 'outlined':
        return { ...baseStyle, borderWidth: 1, borderColor: theme.colors.border };
      case 'flat':
        return { ...baseStyle, backgroundColor: theme.colors.background };
      default:
        return baseStyle;
    }
  };

  return <View style={[getStyle(), style]}>{children}</View>;
}

// Info card with icon and text
export function InfoCard({
  icon,
  title,
  value,
  color,
  onPress,
  style,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <Card
      onPress={onPress}
      variant="elevated"
      style={StyleSheet.flatten([{ alignItems: 'center' }, style])}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.borderRadius.full,
          backgroundColor: `${iconColor}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <Text
        style={{
          fontSize: theme.typography.heading2.fontSize,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.textSecondary,
        }}
      >
        {title}
      </Text>
    </Card>
  );
}

// Action card with chevron
export function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
  style,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <Card
      icon={icon}
      title={title}
      subtitle={subtitle}
      iconColor={iconColor}
      onPress={onPress}
      variant="elevated"
      headerRight={
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.colors.textTertiary}
        />
      }
      style={style}
    >
      <View />
    </Card>
  );
}

// Status card with colored indicator
export function StatusCard({
  title,
  status,
  statusColor,
  icon,
  onPress,
  style,
}: {
  title: string;
  status: string;
  statusColor: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <Card
      icon={icon}
      title={title}
      onPress={onPress}
      variant="elevated"
      style={style}
      headerRight={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${statusColor}15`,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.full,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '600',
              color: statusColor,
            }}
          >
            {status}
          </Text>
        </View>
      }
    >
      <View />
    </Card>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 8,
  },
  content: {},
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
