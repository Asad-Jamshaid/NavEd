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
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import Card, { SimpleCard } from '../../components/common/Card';
import AccessibleButton from '../../components/common/AccessibleButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { ThemeMode, FontSizeScale } from '../../theme';
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  speak,
  triggerHaptic,
} from '../../services/accessibilityService';

// ==========================================
// SETTINGS SCREEN
// ==========================================

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, fontSizeScale, setFontSizeScale, isHighContrast, setHighContrast } = useTheme();
  const { state, updatePreferences, clearAllData } = useApp();
  const userPrefs = state.user?.preferences;

  // Local state for accessibility settings
  const [voiceGuidance, setVoiceGuidance] = useState(userPrefs?.voiceGuidance || false);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(userPrefs?.hapticFeedback ?? true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [isClearing, setIsClearing] = useState(false);

  // Load settings on mount
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getAccessibilitySettings();
    setSpeechRate(settings.speechRate);
    setVoiceGuidance(settings.voiceGuidance);
    setHapticFeedback(settings.hapticFeedback);
  };

  // Save accessibility setting
  const saveAccessibility = useCallback(async (settings: any) => {
    await saveAccessibilitySettings(settings);
    triggerHaptic('light');
  }, []);

  // Test voice
  const testVoice = useCallback(() => {
    speak('This is a test of the voice guidance feature. You can adjust the speech rate using the slider.', {
      rate: speechRate,
    });
  }, [speechRate]);

  // Handle clear all data
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
              // Reset theme to defaults
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

  // Theme mode options
  const themeModes: { value: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'light-mode' },
    { value: 'dark', label: 'Dark', icon: 'dark-mode' },
    { value: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  // Font size options
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
      {/* Theme Section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        APPEARANCE
      </Text>

      <SimpleCard variant="elevated" style={styles.card}>
        {/* Theme Mode */}
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

        {/* Font Size */}
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

        {/* High Contrast */}
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

      {/* Accessibility Section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        ACCESSIBILITY
      </Text>

      <SimpleCard variant="elevated" style={styles.card}>
        {/* Voice Guidance */}
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

        {/* Speech Rate - Only show when voice guidance is enabled */}
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

        {/* Haptic Feedback */}
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

      {/* About Section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        ABOUT
      </Text>

      <SimpleCard variant="elevated" style={styles.card}>
        <View style={styles.aboutHeader}>
          <View
            style={[
              styles.appIcon,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}
          >
            <MaterialIcons name="school" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.aboutInfo}>
            <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
              NavEd
            </Text>
            <Text style={[styles.appTagline, { color: theme.colors.textSecondary }]}>
              Campus Navigation & Study Assistant
            </Text>
            <Text style={[styles.appVersion, { color: theme.colors.textTertiary }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View
          style={[
            styles.techStack,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text style={[styles.techTitle, { color: theme.colors.textSecondary }]}>
            Built with free & open-source tech
          </Text>
          <View style={styles.techItems}>
            <TechBadge label="React Native" theme={theme} />
            <TechBadge label="Expo" theme={theme} />
            <TechBadge label="OpenStreetMap" theme={theme} />
            <TechBadge label="Gemini AI" theme={theme} />
          </View>
        </View>

        <View style={styles.aboutButtons}>
          <TouchableOpacity
            style={[styles.aboutButton, { borderColor: theme.colors.border }]}
            onPress={() => Alert.alert(
              'Privacy Policy',
              'NavEd stores all data locally on your device. No personal data is sent to external servers except when using AI chat features (Gemini API).\n\nYour privacy is our priority.',
            )}
            accessible={true}
            accessibilityLabel="Privacy Policy"
          >
            <MaterialIcons name="privacy-tip" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.aboutButtonText, { color: theme.colors.textPrimary }]}>
              Privacy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aboutButton, { borderColor: theme.colors.border }]}
            onPress={() => Alert.alert(
              'Help & Support',
              'For help and support:\n\n• Check our documentation\n• Contact your campus IT department\n• Report issues on GitHub',
            )}
            accessible={true}
            accessibilityLabel="Help"
          >
            <MaterialIcons name="help-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.aboutButtonText, { color: theme.colors.textPrimary }]}>
              Help
            </Text>
          </TouchableOpacity>
        </View>
      </SimpleCard>

      {/* Danger Zone */}
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

// ==========================================
// HELPER COMPONENTS
// ==========================================

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

function TechBadge({ label, theme }: { label: string; theme: any }) {
  return (
    <View
      style={[
        styles.techBadge,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Text style={[styles.techBadgeText, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

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
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aboutInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  appTagline: {
    fontSize: 14,
    marginTop: 2,
  },
  appVersion: {
    fontSize: 12,
    marginTop: 4,
  },
  techStack: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  techTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  techItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  aboutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  aboutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  aboutButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
});
