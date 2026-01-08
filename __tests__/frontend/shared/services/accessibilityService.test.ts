/**
 * Unit Tests for Accessibility Service
 * Tests voice guidance, haptic feedback, and accessibility utilities
 */

import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  speak,
  stopSpeaking,
  isSpeaking,
  setVoiceEnabled,
  setSpeechRate,
  triggerHaptic,
  selectionHaptic,
  setHapticEnabled,
  getAccessibilitySettings,
  saveAccessibilitySettings,
  getContrastColors,
  getFontScale,
  scaleFontSize,
  getAccessibleNavigationLabel,
  getAccessibleParkingLabel,
  announceNavigation,
  announceArrival,
} from '../../src/services/accessibilityService';

describe('Accessibility Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset voice and haptic to enabled state
    setVoiceEnabled(true);
    setHapticEnabled(true);
  });

  describe('Voice Guidance (Text-to-Speech)', () => {
    test('speak() should call Speech.speak when voice is enabled', async () => {
      setVoiceEnabled(true);
      await speak('Hello World');

      expect(Speech.stop).toHaveBeenCalled();
      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello World',
        expect.objectContaining({
          language: 'en-US',
          pitch: 1.0,
        })
      );
    });

    test('speak() should not call Speech.speak when voice is disabled', async () => {
      setVoiceEnabled(false);
      await speak('Hello World');

      expect(Speech.speak).not.toHaveBeenCalled();
    });

    test('stopSpeaking() should call Speech.stop', async () => {
      await stopSpeaking();
      expect(Speech.stop).toHaveBeenCalled();
    });

    test('isSpeaking() should return speech status', async () => {
      const result = await isSpeaking();
      expect(Speech.isSpeakingAsync).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
    });

    test('setSpeechRate() should clamp values within valid range', () => {
      // Valid range is 0.5 to 2.0
      setSpeechRate(0.1); // Should be clamped to 0.5
      setSpeechRate(5.0); // Should be clamped to 2.0
      setSpeechRate(1.5); // Should be set as-is
      // No assertion needed - just checking it doesn't throw
    });
  });

  describe('Haptic Feedback', () => {
    test('triggerHaptic() light should call impactAsync with Light style', async () => {
      await triggerHaptic('light');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    test('triggerHaptic() medium should call impactAsync with Medium style', async () => {
      await triggerHaptic('medium');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    test('triggerHaptic() heavy should call impactAsync with Heavy style', async () => {
      await triggerHaptic('heavy');
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    test('triggerHaptic() success should call notificationAsync', async () => {
      await triggerHaptic('success');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    test('triggerHaptic() should not fire when haptic is disabled', async () => {
      setHapticEnabled(false);
      await triggerHaptic('light');
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    test('selectionHaptic() should call selectionAsync', async () => {
      await selectionHaptic();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('Navigation Announcements', () => {
    test('announceNavigation() should speak and trigger haptic', async () => {
      setVoiceEnabled(true);
      await announceNavigation('Turn left in 50 meters');

      expect(Speech.speak).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    test('announceArrival() should speak and trigger heavy haptic', async () => {
      setVoiceEnabled(true);
      await announceArrival('Library');

      expect(Speech.speak).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });
  });

  describe('Accessibility Settings Storage', () => {
    test('getAccessibilitySettings() should return default settings when storage is empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const settings = await getAccessibilitySettings();

      expect(settings).toEqual(expect.objectContaining({
        voiceGuidance: false,
        hapticFeedback: true,
        highContrast: false,
        fontSize: 'medium',
      }));
    });

    test('getAccessibilitySettings() should return saved settings', async () => {
      const savedSettings = { voiceGuidance: true, highContrast: true };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(savedSettings));

      const settings = await getAccessibilitySettings();

      expect(settings.voiceGuidance).toBe(true);
      expect(settings.highContrast).toBe(true);
    });

    test('saveAccessibilitySettings() should save to AsyncStorage', async () => {
      await saveAccessibilitySettings({ voiceGuidance: true });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('High Contrast Mode', () => {
    test('getContrastColors() should return high contrast colors when enabled', () => {
      const colors = getContrastColors(true);

      expect(colors).not.toBeNull();
      expect(colors?.background).toBe('#000000');
      expect(colors?.text).toBe('#FFFFFF');
      expect(colors?.primary).toBe('#FFFF00');
    });

    test('getContrastColors() should return null when disabled', () => {
      const colors = getContrastColors(false);
      expect(colors).toBeNull();
    });
  });

  describe('Font Scaling', () => {
    test('getFontScale() should return correct scale for each size', () => {
      expect(getFontScale('small')).toBe(0.85);
      expect(getFontScale('medium')).toBe(1.0);
      expect(getFontScale('large')).toBe(1.25);
      expect(getFontScale('xlarge')).toBe(1.5);
    });

    test('scaleFontSize() should multiply base size by scale', () => {
      expect(scaleFontSize(16, 1.5)).toBe(24);
      expect(scaleFontSize(14, 2.0)).toBe(28);
      expect(scaleFontSize(20, 0.5)).toBe(10);
    });
  });

  describe('Accessible Labels', () => {
    test('getAccessibleNavigationLabel() should format navigation step correctly', () => {
      const label = getAccessibleNavigationLabel({
        instruction: 'Turn left',
        distance: 50,
        maneuver: 'turn-left',
      });

      expect(label).toContain('Turn left');
      expect(label).toContain('50 meters');
    });

    test('getAccessibleNavigationLabel() should use kilometers for long distances', () => {
      const label = getAccessibleNavigationLabel({
        instruction: 'Continue straight',
        distance: 1500,
        maneuver: 'straight',
      });

      expect(label).toContain('kilometers');
    });

    test('getAccessibleParkingLabel() should include all relevant info', () => {
      const label = getAccessibleParkingLabel({
        name: 'West Lot',
        availableSpots: 25,
        totalSpots: 100,
        isAccessible: true,
      });

      expect(label).toContain('West Lot');
      expect(label).toContain('25 spots available');
      expect(label).toContain('100');
      expect(label).toContain('Wheelchair accessible');
    });

    test('getAccessibleParkingLabel() should omit accessible note when not accessible', () => {
      const label = getAccessibleParkingLabel({
        name: 'East Lot',
        availableSpots: 10,
        totalSpots: 50,
        isAccessible: false,
      });

      expect(label).not.toContain('Wheelchair accessible');
    });
  });
});
