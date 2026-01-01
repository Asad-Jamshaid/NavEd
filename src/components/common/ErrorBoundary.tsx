import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AccessibleButton from './AccessibleButton';
import { useTheme } from '../../contexts/ThemeContext';

// ==========================================
// Error Boundary Component
// Catches React errors and displays fallback UI
// ==========================================

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryInner extends Component<Props & { theme: any }, State> {
  constructor(props: Props & { theme: any }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send errors to a service like Sentry (free tier)
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.resetError);
      }

      // Default fallback UI
      const { theme } = this.props;
      return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ScrollView
            contentContainerStyle={styles.content}
            accessibilityLabel="Error screen"
            accessibilityRole="alert"
          >
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Something went wrong</Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              We're sorry, but an unexpected error occurred. The app will try to recover.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={[styles.errorDetails, { backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md }]}>
                <Text style={[styles.errorTitle, { color: theme.colors.error }]}>Error Details (DEV only):</Text>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={[styles.errorStack, { color: theme.colors.textSecondary }]}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <AccessibleButton
              title="Try Again"
              onPress={this.resetError}
              variant="primary"
              icon="refresh"
              style={styles.button}
            />

            <Text style={[styles.supportText, { color: theme.colors.textTertiary }]}>
              If this problem persists, please contact support.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorDetails: {
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxHeight: 300,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    marginBottom: 24,
    minWidth: 200,
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

// Wrapper to provide theme to class component
function ErrorBoundary(props: Props) {
  const { theme } = useTheme();
  return <ErrorBoundaryInner {...props} theme={theme} />;
}

export default ErrorBoundary;
