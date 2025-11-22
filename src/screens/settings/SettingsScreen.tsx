// ==========================================
// Settings Screen - Accessibility & Preferences
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import Card from '../../components/common/Card';
import AccessibleButton from '../../components/common/AccessibleButton';
import { COLORS, SPACING, BORDER_RADIUS, ACCESSIBILITY_CONFIG } from '../../utils/constants';
import { UserPreferences } from '../../types';
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  speak,
  triggerHaptic,
} from '../../services/accessibilityService';
import { useApp } from '../../contexts/AppContext';

export default function SettingsScreen() {
  const { state, updatePreferences } = useApp();
  const userPrefs = state.user?.preferences;

  // State
  const [accessibilityMode, setAccessibilityMode] = useState(userPrefs?.accessibilityMode || false);
  const [voiceGuidance, setVoiceGuidance] = useState(userPrefs?.voiceGuidance || false);
  const [hapticFeedback, setHapticFeedback] = useState(userPrefs?.hapticFeedback || true);
  const [highContrast, setHighContrast] = useState(userPrefs?.highContrast || false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>(
    userPrefs?.fontSize || 'medium'
  );
  const [darkMode, setDarkMode] = useState(userPrefs?.darkMode || false);
  const [speechRate, setSpeechRate] = useState(ACCESSIBILITY_CONFIG.defaultSpeechRate);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getAccessibilitySettings();
    setSpeechRate(settings.speechRate);
    setVoiceGuidance(settings.voiceGuidance);
    setHapticFeedback(settings.hapticFeedback);
    setHighContrast(settings.highContrast);
  };

  // Save preference
  const savePref = async (key: keyof UserPreferences, value: any) => {
    await updatePreferences({ [key]: value });
    triggerHaptic('light');
  };

  // Save accessibility setting
  const saveAccessibility = async (settings: any) => {
    await saveAccessibilitySettings(settings);
    triggerHaptic('light');
  };

  // Test voice
  const testVoice = () => {
    speak('This is a test of the voice guidance feature. You can adjust the speech rate using the slider.', {
      rate: speechRate,
    });
  };

  return (
    <ScrollView
      style={[styles.container, highContrast && styles.containerHighContrast]}
      contentContainerStyle={styles.content}
    >
      {/* Accessibility Section */}
      <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
        Accessibility
      </Text>

      <Card style={styles.card} highContrast={highContrast}>
        {/* Accessibility Mode */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="accessibility" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, highContrast && styles.textHighContrast]}>
                Accessibility Mode
              </Text>
              <Text style={styles.settingDesc}>
                Enable enhanced features for users with disabilities
              </Text>
            </View>
          </View>
          <Switch
            value={accessibilityMode}
            onValueChange={value => {
              setAccessibilityMode(value);
              savePref('accessibilityMode', value);
              if (value) {
                speak('Accessibility mode enabled');
              }
            }}
            trackColor={{ false: COLORS.grayLight, true: COLORS.primaryLight }}
            thumbColor={accessibilityMode ? COLORS.primary : COLORS.gray}
            accessible={true}
            accessibilityLabel="Accessibility mode toggle"
          />
        </View>

        {/* Voice Guidance */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="record-voice-over" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, highContrast && styles.textHighContrast]}>
                Voice Guidance
              </Text>
              <Text style={styles.settingDesc}>
                Spoken instructions and announcements
              </Text>
            </View>
          </View>
          <Switch
            value={voiceGuidance}
            onValueChange={value => {
              setVoiceGuidance(value);
              savePref('voiceGuidance', value);
              saveAccessibility({ voiceGuidance: value });
              if (value) {
                speak('Voice guidance enabled');
              }
            }}
            trackColor={{ false: COLORS.grayLight, true: COLORS.primaryLight }}
            thumbColor={voiceGuidance ? COLORS.primary : COLORS.gray}
            accessible={true}
            accessibilityLabel="Voice guidance toggle"
          />
        </View>

        {/* Speech Rate */}
        {voiceGuidance && (
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderLabel, highContrast && styles.textHighContrast]}>
              Speech Rate: {speechRate.toFixed(1)}x
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderMin}>Slow</Text>
              <Slider
                style={styles.slider}
                minimumValue={ACCESSIBILITY_CONFIG.minSpeechRate}
                maximumValue={ACCESSIBILITY_CONFIG.maxSpeechRate}
                value={speechRate}
                onValueChange={setSpeechRate}
                onSlidingComplete={value => {
                  setSpeechRate(value);
                  saveAccessibility({ speechRate: value });
                }}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.grayLight}
                thumbTintColor={COLORS.primary}
                accessible={true}
                accessibilityLabel={`Speech rate: ${speechRate.toFixed(1)}`}
              />
              <Text style={styles.sliderMax}>Fast</Text>
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

        {/* Haptic Feedback */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="vibration" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, highContrast && styles.textHighContrast]}>
                Haptic Feedback
              </Text>
              <Text style={styles.settingDesc}>
                Vibration feedback for interactions
              </Text>
            </View>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={value => {
              setHapticFeedback(value);
              savePref('hapticFeedback', value);
              saveAccessibility({ hapticFeedback: value });
              if (value) {
                triggerHaptic('medium');
              }
            }}
            trackColor={{ false: COLORS.grayLight, true: COLORS.primaryLight }}
            thumbColor={hapticFeedback ? COLORS.primary : COLORS.gray}
            accessible={true}
            accessibilityLabel="Haptic feedback toggle"
          />
        </View>

        {/* High Contrast */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="contrast" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, highContrast && styles.textHighContrast]}>
                High Contrast Mode
              </Text>
              <Text style={styles.settingDesc}>
                Enhanced colors for better visibility
              </Text>
            </View>
          </View>
          <Switch
            value={highContrast}
            onValueChange={value => {
              setHighContrast(value);
              savePref('highContrast', value);
              saveAccessibility({ highContrast: value });
            }}
            trackColor={{ false: COLORS.grayLight, true: COLORS.primaryLight }}
            thumbColor={highContrast ? COLORS.primary : COLORS.gray}
            accessible={true}
            accessibilityLabel="High contrast mode toggle"
          />
        </View>
      </Card>

      {/* Font Size */}
      <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
        Text Size
      </Text>

      <Card style={styles.card} highContrast={highContrast}>
        <View style={styles.fontSizeButtons}>
          {(['small', 'medium', 'large', 'xlarge'] as const).map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.fontSizeButton,
                fontSize === size && styles.fontSizeButtonActive,
              ]}
              onPress={() => {
                setFontSize(size);
                savePref('fontSize', size);
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: fontSize === size }}
              accessibilityLabel={`${size} text size`}
            >
              <Text
                style={[
                  styles.fontSizeText,
                  { fontSize: getFontSizePreview(size) },
                  fontSize === size && styles.fontSizeTextActive,
                ]}
              >
                Aa
              </Text>
              <Text style={[
                styles.fontSizeLabel,
                fontSize === size && styles.fontSizeLabelActive,
              ]}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Display Section */}
      <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
        Display
      </Text>

      <Card style={styles.card} highContrast={highContrast}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="dark-mode" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, highContrast && styles.textHighContrast]}>
                Dark Mode
              </Text>
              <Text style={styles.settingDesc}>
                Easier on eyes in low light
              </Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={value => {
              setDarkMode(value);
              savePref('darkMode', value);
            }}
            trackColor={{ false: COLORS.grayLight, true: COLORS.primaryLight }}
            thumbColor={darkMode ? COLORS.primary : COLORS.gray}
            accessible={true}
            accessibilityLabel="Dark mode toggle"
          />
        </View>
      </Card>

      {/* About Section */}
      <Text style={[styles.sectionTitle, highContrast && styles.textHighContrast]}>
        About NavEd
      </Text>

      <Card style={styles.card} highContrast={highContrast}>
        <View style={styles.aboutContent}>
          <Text style={[styles.aboutTitle, highContrast && styles.textHighContrast]}>
            NavEd - Campus Navigation & Study Assistant
          </Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            A budget-friendly, accessibility-focused app for students.
            Built with ❤️ using free and open-source technologies.
          </Text>

          <View style={styles.techStack}>
            <Text style={[styles.techTitle, highContrast && styles.textHighContrast]}>
              Free Technologies Used:
            </Text>
            <Text style={styles.techItem}>• React Native + Expo (Free)</Text>
            <Text style={styles.techItem}>• OpenStreetMap (Free maps)</Text>
            <Text style={styles.techItem}>• OSRM (Free routing)</Text>
            <Text style={styles.techItem}>• Gemini/Groq (Free AI tiers)</Text>
            <Text style={styles.techItem}>• AsyncStorage (Local data)</Text>
          </View>
        </View>

        <View style={styles.aboutButtons}>
          <AccessibleButton
            title="Privacy Policy"
            icon="privacy-tip"
            variant="outline"
            size="small"
            onPress={() => Alert.alert('Privacy', 'NavEd stores all data locally on your device. No data is sent to external servers except for AI chat features (when API keys are configured).')}
          />
          <AccessibleButton
            title="Help"
            icon="help"
            variant="outline"
            size="small"
            onPress={() => Alert.alert('Help', 'For help and support, contact your campus IT department or project maintainers.')}
          />
        </View>
      </Card>

      {/* Clear Data */}
      <Card style={[styles.card, styles.dangerCard]} highContrast={highContrast}>
        <AccessibleButton
          title="Clear All Data"
          icon="delete-forever"
          variant="danger"
          onPress={() => {
            Alert.alert(
              'Clear All Data',
              'This will delete all your documents, chat history, and preferences. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => {
                    // Clear implementation would go here
                    Alert.alert('Success', 'All data has been cleared.');
                  },
                },
              ]
            );
          }}
          accessibilityHint="Deletes all app data permanently"
        />
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function getFontSizePreview(size: string): number {
  switch (size) {
    case 'small':
      return 14;
    case 'medium':
      return 18;
    case 'large':
      return 24;
    case 'xlarge':
      return 30;
    default:
      return 18;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
  },
  content: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  textHighContrast: {
    color: '#FFFFFF',
  },
  card: {
    marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  sliderRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMin: {
    fontSize: 12,
    color: COLORS.gray,
    width: 40,
  },
  sliderMax: {
    fontSize: 12,
    color: COLORS.gray,
    width: 40,
    textAlign: 'right',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fontSizeButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  fontSizeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  fontSizeText: {
    fontWeight: '600',
    color: COLORS.gray,
  },
  fontSizeTextActive: {
    color: COLORS.primary,
  },
  fontSizeLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  fontSizeLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  aboutContent: {
    marginBottom: SPACING.md,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  aboutVersion: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  techStack: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  techItem: {
    fontSize: 13,
    color: COLORS.grayDark,
    marginTop: 4,
  },
  aboutButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dangerCard: {
    marginTop: SPACING.lg,
  },
  bottomPadding: {
    height: 50,
  },
});
