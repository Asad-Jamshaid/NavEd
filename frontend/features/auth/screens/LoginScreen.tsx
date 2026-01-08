// ==========================================
// Login Screen - Modern Minimal Design
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import AccessibleButton from '../../../shared/components/common/AccessibleButton';
import Card from '../../../shared/components/common/Card';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { triggerHaptic } from '../../../shared/services/accessibilityService';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onNavigateToSignup, onLoginSuccess }: LoginScreenProps) {
  const { theme } = useTheme();
  const { signIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      triggerHaptic('medium');
      return;
    }

    triggerHaptic('light');
    const { error } = await signIn(email.trim(), password);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
      triggerHaptic('heavy');
    } else {
      triggerHaptic('light');
      onLoginSuccess();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialIcons name="school" size={64} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign in to continue to NavEd
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: errors.email ? theme.colors.error : theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={errors.email ? theme.colors.error : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {errors.email && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: errors.password ? theme.colors.error : theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="lock"
                size={20}
                color={errors.password ? theme.colors.error : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>
            )}
          </View>

          <AccessibleButton
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.button}
            icon="login"
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToSignup} disabled={isLoading}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

