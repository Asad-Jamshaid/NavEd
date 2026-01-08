// ==========================================
// Settings Screen - Modern Minimal Design
// ==========================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import Card, { SimpleCard } from '../components/common/Card';
import AccessibleButton from '../components/common/AccessibleButton';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeMode, FontSizeScale } from '../theme';
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  speak,
  triggerHaptic,
} from '../services/accessibilityService';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, fontSizeScale, setFontSizeScale, isHighContrast, setHighContrast } = useTheme();
  const { state, updatePreferences, clearAllData } = useApp();
  const { isAuthenticated, isAuthEnabled, signOut, user } = useAuth();
  const userPrefs = state.user?.preferences;

  const [voiceGuidance, setVoiceGuidance] = useState(userPrefs?.voiceGuidance || false);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(userPrefs?.hapticFeedback ?? true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isClearing, setIsClearing] = useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getAccessibilitySettings();
    setSpeechRate(settings.speechRate);
    setVoiceGuidance(settings.voiceGuidance);
    setHapticFeedback(settings.hapticFeedback);
  };

  const saveAccessibility = useCallback(async (settings: any) => {
    await saveAccessibilitySettings(settings);
    triggerHaptic('light');
  }, []);

  const testVoice = useCallback(() => {
    speak('This is a test of the voice guidance feature. You can adjust the speech rate using the slider.', {
      rate: speechRate,
    });
  }, [speechRate]);

  const handleSignOut = useCallback(async () => {
    if (!isAuthEnabled || !isAuthenticated) {
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message || 'Failed to sign out. Please try again.');
            } else {
              triggerHaptic('light');
            }
          },
        },
      ]
    );
  }, [isAuthEnabled, isAuthenticated, signOut]);

  const handleClearData = useCallback(async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your documents, chat history, parked vehicle location, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllData();
              setThemeMode('system');
              setFontSizeScale('medium');
              setHighContrast(false);
              Alert.alert('Success', 'All data has been cleared. The app will use default settings.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [clearAllData, setThemeMode, setFontSizeScale, setHighContrast]);

  const themeModes: { value: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'light-mode' },
    { value: 'dark', label: 'Dark', icon: 'dark-mode' },
    { value: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  const fontSizes: { value: FontSizeScale; label: string; preview: number }[] = [
    { value: 'small', label: 'S', preview: 14 },
    { value: 'medium', label: 'M', preview: 16 },
    { value: 'large', label: 'L', preview: 20 },
    { value: 'xlarge', label: 'XL', preview: 24 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        APPEARANCE
      </Text>

      <SimpleCard variant="elevated" style={styles.card}>
        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          Theme
        </Text>
        <View style={styles.themeModeContainer}>
          {themeModes.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.themeModeButton,
                {
                  backgroundColor: themeMode === mode.value
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              onPress={() => {
                setThemeMode(mode.value);
                triggerHaptic('light');
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: themeMode === mode.value }}
              accessibilityLabel={`${mode.label} theme`}
            >
              <MaterialIcons
                name={mode.icon}
                size={20}
                color={themeMode === mode.value ? theme.colors.textInverse : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.themeModeLabel,
                  {
                    color: themeMode === mode.value ? theme.colors.textInverse : theme.colors.textSecondary,
                  },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
          Text Size
        </Text>
        <View style={styles.fontSizeContainer}>
          {fontSizes.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.fontSizeButton,
                {
                  backgroundColor: fontSizeScale === size.value
                    ? `${theme.colors.primary}15`
                    : 'transparent',
                  borderColor: fontSizeScale === size.value
                    ? theme.colors.primary
                    : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              onPress={() => {
                setFontSizeScale(size.value);
                triggerHaptic('light');
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: fontSizeScale === size.value }}
              accessibilityLabel={`${size.label} text size`}
            >
              <Text
                style={[
                  styles.fontSizePreview,
                  {
                    fontSize: size.preview,
                    color: fontSizeScale === size.value
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                Aa
              </Text>
              <Text
                style={[
                  styles.fontSizeLabel,
                  {
                    color: fontSizeScale === size.value
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                  },
                ]}
              >
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <SettingRow
          icon="contrast"
          title="High Contrast"
          description="Enhanced colors for better visibility"
          value={isHighContrast}
          onValueChange={(value) => {
            setHighContrast(value);
            triggerHaptic('light');
          }}
          theme={theme}
        />
      </SimpleCard>

      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        ACCESSIBILITY
      </Text>

      <SimpleCard variant="elevated" style={styles.card}>
        <SettingRow
          icon="record-voice-over"
          title="Voice Guidance"
          description="Spoken instructions and announcements"
          value={voiceGuidance}
          onValueChange={(value) => {
            setVoiceGuidance(value);
            updatePreferences({ voiceGuidance: value });
            saveAccessibility({ voiceGuidance: value });
            if (value) {
              speak('Voice guidance enabled');
            }
          }}
          theme={theme}
        />

        {voiceGuidance && (
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: theme.colors.textPrimary }]}>
                Speech Rate
              </Text>
              <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                {speechRate.toFixed(1)}x
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderMin, { color: theme.colors.textTertiary }]}>Slow</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2.0}
                value={speechRate}
                onValueChange={(value: number) => setSpeechRate(value)}
                onSlidingComplete={(value: number) => {
                  setSpeechRate(value);
                  saveAccessibility({ speechRate: value });
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
                accessible={true}
                accessibilityLabel={`Speech rate: ${speechRate.toFixed(1)}`}
              />
              <Text style={[styles.sliderMax, { color: theme.colors.textTertiary }]}>Fast</Text>
            </View>
            <AccessibleButton
              title="Test Voice"
              icon="play-arrow"
              size="small"
              variant="outline"
              onPress={testVoice}
            />
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <SettingRow
          icon="vibration"
          title="Haptic Feedback"
          description="Vibration feedback for interactions"
          value={hapticFeedback}
          onValueChange={(value) => {
            setHapticFeedback(value);
            updatePreferences({ hapticFeedback: value });
            saveAccessibility({ hapticFeedback: value });
            if (value) {
              triggerHaptic('medium');
            }
          }}
          theme={theme}
        />
      </SimpleCard>

      {isAuthEnabled && isAuthenticated && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ACCOUNT
          </Text>

          <SimpleCard variant="elevated" style={styles.card}>
            <View style={styles.accountContent}>
              <View style={styles.accountInfo}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: `${theme.colors.primary}15` },
                  ]}
                >
                  <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.accountText}>
                  <Text style={[styles.accountTitle, { color: theme.colors.textPrimary }]}>
                    {user?.name || user?.email || 'User'}
                  </Text>
                  <Text style={[styles.accountDesc, { color: theme.colors.textSecondary }]}>
                    {user?.email || 'Signed in'}
                  </Text>
                </View>
              </View>
              <AccessibleButton
                title="Sign Out"
                icon="logout"
                variant="outline"
                size="small"
                onPress={handleSignOut}
                accessibilityHint="Sign out of your account"
              />
            </View>
          </SimpleCard>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>
        DANGER ZONE
      </Text>

      <SimpleCard variant="outlined" style={StyleSheet.flatten([styles.card, { borderColor: theme.colors.error }])}>
        <View style={styles.dangerContent}>
          <View style={styles.dangerInfo}>
            <MaterialIcons name="warning" size={24} color={theme.colors.error} />
            <View style={styles.dangerText}>
              <Text style={[styles.dangerTitle, { color: theme.colors.textPrimary }]}>
                Clear All Data
              </Text>
              <Text style={[styles.dangerDesc, { color: theme.colors.textSecondary }]}>
                Delete all documents, chat history, and settings
              </Text>
            </View>
          </View>
          <AccessibleButton
            title={isClearing ? 'Clearing...' : 'Clear'}
            variant="danger"
            size="small"
            onPress={handleClearData}
            disabled={isClearing}
            accessibilityHint="Deletes all app data permanently"
          />
        </View>
      </SimpleCard>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  theme: any;
}

function SettingRow({ icon, title, description, value, onValueChange, theme }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View
          style={[
            styles.settingIcon,
            { backgroundColor: `${theme.colors.primary}15` },
          ]}
        >
          <MaterialIcons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          <Text style={[styles.settingDesc, { color: theme.colors.textTertiary }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: `${theme.colors.primary}80`
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
        accessible={true}
        accessibilityLabel={`${title} toggle`}
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  themeModeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
  },
  fontSizePreview: {
    fontWeight: '700',
    marginBottom: 4,
  },
  fontSizeLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  sliderSection: {
    paddingVertical: 12,
    paddingLeft: 48,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMin: {
    fontSize: 11,
    width: 32,
  },
  sliderMax: {
    fontSize: 11,
    width: 32,
    textAlign: 'right',
  },
  dangerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dangerText: {
    marginLeft: 12,
    flex: 1,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
  accountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  accountText: {
    marginLeft: 12,
    flex: 1,
  },
  accountTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});

