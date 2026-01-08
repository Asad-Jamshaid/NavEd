// ==========================================
// Signup Screen - Modern Minimal Design
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

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

export default function SignupScreen({ onNavigateToLogin, onSignupSuccess }: SignupScreenProps) {
  const { theme } = useTheme();
  const { signUp, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      triggerHaptic('medium');
      return;
    }

    triggerHaptic('light');
    const { error } = await signUp(email.trim(), password, name.trim());

    if (error) {
      Alert.alert('Sign Up Failed', error.message || 'Unable to create account. Please try again.');
      triggerHaptic('heavy');
    } else {
      triggerHaptic('light');
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: onSignupSuccess,
        },
      ]);
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
          <MaterialIcons name="person-add" size={64} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign up to get started with NavEd
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: errors.name ? theme.colors.error : theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="person"
                size={20}
                color={errors.name ? theme.colors.error : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            {errors.name && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.name}</Text>
            )}
          </View>

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
                placeholder="Create a password"
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={errors.confirmPassword ? theme.colors.error : theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.textTertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <AccessibleButton
            title="Sign Up"
            onPress={handleSignup}
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.button}
            icon="person-add"
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sign In</Text>
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



