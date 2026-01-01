// ==========================================
// Error State Component
// Display when an error occurs
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import AccessibleButton from './AccessibleButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  compact?: boolean;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  icon = 'error-outline',
  style,
  compact = false,
}: ErrorStateProps) {
  const { theme } = useTheme();

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={theme.colors.error}
          style={styles.compactIcon}
        />
        <Text
          style={[styles.compactText, { color: theme.colors.error }]}
          numberOfLines={2}
        >
          {message}
        </Text>
        {onRetry && (
          <AccessibleButton
            title={retryLabel}
            onPress={onRetry}
            variant="ghost"
            size="small"
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${theme.colors.error}15` },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={48}
          color={theme.colors.error}
        />
      </View>

      <Text
        style={[
          styles.title,
          { color: theme.colors.textPrimary },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          { color: theme.colors.textSecondary },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <AccessibleButton
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          icon="refresh"
          style={styles.button}
        />
      )}
    </View>
  );
}

// Pre-built error states for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="wifi-off"
      title="Connection failed"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
    />
  );
}

export function LoadingError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon="cloud-off"
      title="Failed to load"
      message="We couldn't load the data. Please try again."
      onRetry={onRetry}
    />
  );
}

export function ApiKeyError({ onSetup }: { onSetup?: () => void }) {
  return (
    <ErrorState
      icon="vpn-key"
      title="API Key Required"
      message="Please configure your API key in Settings to use this feature."
      onRetry={onSetup}
      retryLabel="Go to Settings"
    />
  );
}

export function PermissionError({ permission, onRequest }: { permission: string; onRequest?: () => void }) {
  return (
    <ErrorState
      icon="lock"
      title="Permission Required"
      message={`This feature requires ${permission} permission to work properly.`}
      onRetry={onRequest}
      retryLabel="Grant Permission"
    />
  );
}

export function NotFoundError() {
  return (
    <ErrorState
      icon="search-off"
      title="Not Found"
      message="The requested content could not be found."
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  compactIcon: {
    marginRight: 8,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
  },
});
