// ==========================================
// Loading Skeleton Component
// Shimmer effect placeholder for loading states
// ==========================================

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius } from '../../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export default function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius: customRadius,
  style,
  variant = 'rectangular',
}: LoadingSkeletonProps) {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'text':
        return {
          height: height || 16,
          borderRadius: borderRadius.sm,
        };
      case 'circular':
        return {
          width: height,
          height: height,
          borderRadius: (height || 40) / 2,
        };
      case 'card':
        return {
          height: height || 120,
          borderRadius: borderRadius.md,
        };
      default:
        return {
          height: height,
          borderRadius: customRadius ?? borderRadius.sm,
        };
    }
  };

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const widthStyle = typeof width === 'string' 
    ? { width: width as any } 
    : { width };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        widthStyle,
        {
          backgroundColor: theme.isDark ? '#374151' : '#E5E7EB',
          opacity,
        },
        getVariantStyle(),
        style,
      ]}
    />
  );
}

// Pre-built skeleton layouts
export function TextSkeleton({ lines = 3, lastLineWidth = '60%' }: { lines?: number; lastLineWidth?: string }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={index < lines - 1 ? styles.textLine : undefined}
        />
      ))}
    </View>
  );
}

export function CardSkeleton() {
  const { theme } = useTheme();

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <LoadingSkeleton variant="circular" height={48} />
        <View style={styles.cardHeaderText}>
          <LoadingSkeleton variant="text" width="70%" height={18} />
          <LoadingSkeleton variant="text" width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
      <LoadingSkeleton variant="rectangular" height={16} style={{ marginTop: 16 }} />
      <LoadingSkeleton variant="rectangular" height={16} width="80%" style={{ marginTop: 8 }} />
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <LoadingSkeleton variant="circular" height={40} />
      <View style={styles.listItemContent}>
        <LoadingSkeleton variant="text" width="60%" height={16} />
        <LoadingSkeleton variant="text" width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    marginBottom: 8,
  },
  cardContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});
