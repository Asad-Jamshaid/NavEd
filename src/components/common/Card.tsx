// ==========================================
// Accessible Card Component
// ==========================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { selectionHaptic } from '../../services/accessibilityService';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  elevated?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  highContrast?: boolean;
}

export default function Card({
  children,
  onPress,
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary,
  elevated = true,
  style,
  accessibilityLabel,
  accessibilityHint,
  highContrast = false,
}: CardProps) {
  const handlePress = async () => {
    if (onPress) {
      await selectionHaptic();
      onPress();
    }
  };

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    highContrast && styles.highContrast,
    style,
  ];

  const content = (
    <>
      {(icon || title || subtitle) && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, highContrast && styles.iconContainerHighContrast]}>
              <MaterialIcons
                name={icon}
                size={24}
                color={highContrast ? '#000000' : iconColor}
              />
            </View>
          )}
          {(title || subtitle) && (
            <View style={styles.titleContainer}>
              {title && (
                <Text style={[styles.title, highContrast && styles.titleHighContrast]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, highContrast && styles.subtitleHighContrast]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyle}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  elevated: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highContrast: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  iconContainerHighContrast: {
    backgroundColor: '#FFFF00',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  titleHighContrast: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  subtitleHighContrast: {
    color: '#AAAAAA',
  },
  content: {},
});
