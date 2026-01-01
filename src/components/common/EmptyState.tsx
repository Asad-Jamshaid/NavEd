// ==========================================
// Empty State Component
// Display when there's no data to show
// ==========================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import AccessibleButton from './AccessibleButton';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={48}
          color={theme.colors.textTertiary}
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

      {description && (
        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <AccessibleButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

// Pre-built empty states for common scenarios
export function NoResultsEmpty({ searchQuery, onClear }: { searchQuery?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon="search-off"
      title="No results found"
      description={searchQuery ? `We couldn't find anything matching "${searchQuery}"` : 'Try adjusting your search or filters'}
      actionLabel={onClear ? 'Clear search' : undefined}
      onAction={onClear}
    />
  );
}

export function NoDocumentsEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon="folder-open"
      title="No documents yet"
      description="Upload your study materials to get started with the AI assistant"
      actionLabel="Upload Document"
      onAction={onUpload}
    />
  );
}

export function NoParkingEmpty() {
  return (
    <EmptyState
      icon="local-parking"
      title="No parking data"
      description="Parking information is not available at the moment"
    />
  );
}

export function NoMessagesEmpty() {
  return (
    <EmptyState
      icon="chat-bubble-outline"
      title="Start a conversation"
      description="Ask questions about your documents or get study help"
    />
  );
}

export function OfflineEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="wifi-off"
      title="You're offline"
      description="Check your internet connection and try again"
      actionLabel="Retry"
      onAction={onRetry}
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
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});
